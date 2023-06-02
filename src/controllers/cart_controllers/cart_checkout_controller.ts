import {NextFunction, Request, Response} from 'express';
import prisma from "../../config/database";
import {orderItems, orders} from "@prisma/client";
import axios from "axios";
import * as https from "https";
import MargERPEncryption from "../../config/marg";

export default class CartCheckoutController {
    public static async checkout(req: Request, res: Response, next: NextFunction) {
        try {

            //Check if uid is provided
            const uid: number = Number(req.headers.uid);

            if (!uid) {
                return res.status(400).json({
                    status: 'error',
                    data: null,
                    message: 'Invalid or missing uid',
                });
            }

            //Check for required parameters
            const addressId: number = Number(req.body.addressId);

            //Check if address id is provided.
            if (!addressId) {
                return res.status(400).json({
                    status: 'error',
                    data: null,
                    message: 'Invalid or missing address id',
                });
            }

            //Check if the address belongs to the user
            const address = await prisma.addresses.findFirst({
                where: {
                    id: addressId,
                }
            });

            if (!address || address.userId !== uid) {
                return res.status(400).json({
                    status: 'error',
                    data: {
                        description: "Either the given address id does not exist or it does not belong to the user",
                    },
                    message: 'Invalid address id',
                });
            }

            //Fetch the user's cart items
            const cartProducts = await prisma.cartProducts.findMany({
                where: {
                    userId: uid,
                },
                include: {
                    product: true,
                }
            });

            //Check if cart is empty
            if (cartProducts.length === 0) {
                return res.status(400).json({
                    status: 'error',
                    data: null,
                    message: 'Cart is empty',
                });
            }

            //Calculate order total
            const orderTotal = cartProducts.reduce((acc, cartProduct) => {
                return acc + (cartProduct.product.saleRate! * cartProduct.quantity);
            }, 0);

            //Create order
            const order = await prisma.orders.create({
                data: {
                    userId: uid,
                    orderItems: {
                        createMany: {
                            data: cartProducts.map((cartProduct) => {
                                return {
                                    productId: cartProduct.productId,
                                    quantity: cartProduct.quantity,
                                    amount: cartProduct.product.saleRate! * cartProduct.quantity,
                                }
                            }),
                            skipDuplicates: true,
                        }
                    },
                    addressId: addressId,
                    amount: orderTotal,
                },
                include: {
                    orderItems: true,
                }
            });


            //Delete cart items
            await prisma.cartProducts.deleteMany({
                where: {
                    userId: uid,
                }
            });

            // After order is created and cart is emptied, order should be synced with the MargERP system
            const result = await CartCheckoutController.syncOrderWithMargERP(order);

            req.body.orderId = order.id;
            req.body.order = order;
            next();
        } catch (e: any) {
            console.log(e);
            return res.status(500).json({
                status: 'error',
                data: e,
                message: e.message,
            });
        }
    }

    private static async syncOrderWithMargERP(order: orders & { orderItems: orderItems[] }) {
        try {
            //Get the address of the user
            const address = await prisma.addresses.findUnique({
                where: {
                    id: order.addressId,
                }
            });

            //Get the user details
            const user = await prisma.users.findUnique({
                where: {
                    id: order.userId,
                }
            });

            //Get the order items
            const orderItems = order.orderItems;
            let pro = '';
            let qty = '';
            let free = '';


            for (let i = 0; i < orderItems.length; i++) {
                const product = await prisma.products.findUnique({
                    where: {
                        id: orderItems[i].productId,
                    }
                });
                if (!product) continue;

                if (i > 0) {
                    pro += ",";
                    qty += ",";
                    free += ",";
                }
                pro += `${product.code}`;
                qty += `${orderItems[i].quantity}`;
                free += `0`;
            }

            const jsonstr = `{ 
            "OrderID":"",
            "OrderNo": "${Math.floor(Math.random() * 100000)}",
            "CustomerID": "4636591",
            "MargID": "307428",
            "Type": "S",
            "Sid": "166791",
            "ProductCode": "${pro}",
            "Quantity":"${qty}",
            "Free": "${free}",  
            "Lat": "",
            "Lng": "",
            "Address": "",
            "GpsID": "0",
            "UserType": "1",
            "Points": "0.00",
            "Discounts": "0",
            "Transport": "${address?.line1} ${address?.line2}",
            "Delivery": "${address?.line1} ${address?.pinCode}",
            "Bankname": "",
            "BankAdd1": "",
            "BankAdd2": "",
            "shipname": "",
            "shipAdd1": "",
            "shipAdd2": "",
            "shipAdd3": "",
            "paymentmode": "1",
            "paymentmodeAmount": "0",
            "payment_remarks": "",
            "order_remarks": "${user?.contactNumber} ${user?.displayName}",
            "CustMobile": "${user?.contactNumber}",
            "CompanyCode": "AKASHMEGA2",
            "OrderFrom": "AKASHMEGA2" 
          }`;
            // return jsonstr;
            const response = await axios.post("https://wservices.margcompusoft.com/api/eOnlineData/InsertOrderDetail", jsonstr, {
                headers: {
                    'Content-Type': 'application/json',
                },
                responseType: 'json',
                httpsAgent: new https.Agent({
                    rejectUnauthorized: false,
                }),
            });
            const result = MargERPEncryption.decompress(response.data);
            let data;
            try {
                data = JSON.parse(result);
            } catch (e) {
                return result;
            }
            return data;
        } catch (e) {
            console.log(e);
            throw {
                message: "Error syncing order with MargERP"
            }
        }
    }
}