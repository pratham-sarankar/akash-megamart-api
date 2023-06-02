import {Request, Response} from "express";
import prisma from "../../../config/database";
import {OrderStatus} from "@prisma/client";
import Razorpay from "../../../config/payment_configs/razorpay";

export default class RazorPayController {

    public static async createOrderAndSendResponse(req: Request, res: Response) {
        //Check if uid is provided
        const uid: number = Number(req.headers.uid);

        if (!uid) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: 'Invalid or missing uid',
            });
        }

        const user = await prisma.users.findUnique({
            where: {
                id: uid
            }
        });

        if (user == null) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: "User not found"
            });
        }

        //Check for required parameters - orderId
        const orderId: number = Number(req.body.orderId);

        //Check if order id is provided.
        if (!orderId) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: 'Invalid or missing order id',
            });
        }

        //Check if the order belongs to the user
        const order = req.body.order ?? await prisma.orders.findFirst({
            where: {
                id: orderId,
            }
        });

        if (!order || order.userId !== uid) {
            return res.status(400).json({
                status: 'error',
                data: {
                    description: "Either the given order id does not exist or it does not belong to the user",
                },
                message: 'Invalid order id',
            });
        }

        //Check if the order is already paid
        if (order.status == OrderStatus.INITIATED) {
            return res.status(400).json({
                status: 'error',
                data: {
                    description: "The order is already initiated",
                },
                message: 'Invalid order id',
            });
        }

        //Create a razorpay order
        //Since the amount must be sent in paise, we multiply it by 100
        const amount = order.amount * 100;
        await Razorpay.orders.create({
                amount: amount,
                currency: order.currency,
            },
            async (err, data) => {
                if (err) {
                    return res.status(400).json({
                        status: 'error',
                        data: {
                            description: err,
                        },
                        message: 'Error creating razorpay order',
                    });
                }
                //Update the order status to INITIATED
                await prisma.orders.update({
                    where: {
                        id: order.id,
                    },
                    data: {
                        status: OrderStatus.INITIATED,
                        razorpayOrderId: data.id,
                    }
                });

                return res.status(200).json({
                    status: 'success',
                    data: {
                        'key': process.env.RZR_KEY_ID,
                        'amount': order.amount, //in the smallest currency sub-unit.
                        'name': process.env.RZR_BUSSINESS_NAME,
                        'order_id': data.id, // Generate order_id using Orders API
                        'description': 'Checkout Payment for order id: ' + order.id,
                        'timeout': 60, // in seconds
                        'prefill': {
                            'contact': user.contactNumber,
                            'email': user.email,
                        }

                    },
                    message: 'Razorpay order created successfully'
                });
            }
        );
        return;
    }

    public static async verifyPayment(req: Request, res: Response) {
        //Check if uid is provided
        const uid: number = Number(req.headers.uid);

        if (!uid) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: 'Invalid or missing uid',
            });
        }

        const user = await prisma.users.findUnique({
            where: {
                id: uid
            },
            include: {
                orders: true,
            }
        });

        if (user == null) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: "User not found"
            });
        }

        //Check if the required parameters are provided - orderId, paymentId
        const orderId: string = req.body.orderId;
        const paymentId: string = req.body.paymentId;

        if (!orderId || !paymentId) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: 'Invalid or missing orderId or paymentId',
            });
        }

        //Verify the payment
        const payment = await Razorpay.payments.fetch(paymentId);
        if (payment.status == 'captured') {
            //Update the order status to PROCESSING
            await prisma.orders.update({
                where: {
                    razorpayOrderId: orderId,
                },
                data: {
                    status: OrderStatus.PROCESSING,
                }
            });
            return res.status(200).json({
                status: 'success',
                data: {
                    description: "Payment successful",
                },
                message: 'Payment successful',
            });
        } else {
            return res.status(400).json({
                status: 'error',
                data: {
                    description: "Payment failed",
                },
                message: 'Payment failed',
            });
        }
    }
}