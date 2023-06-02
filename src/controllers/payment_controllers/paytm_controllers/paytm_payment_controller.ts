import {Request, Response} from "express";
import prisma from "../../../config/database";
import {OrderStatus} from "@prisma/client";
import PaytmGateway from "./paytm_gateway";

export default class PaytmInitiateTransactionController {
    public static async initiate(req: Request, res: Response) {
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


        //Send request to initiate a transaction
        const txnToken = await PaytmGateway.createTxnToken(user, order);

        //Update the order status
        await prisma.orders.update({
            where: {
                id: order.id,
            },
            data: {
                status: OrderStatus.INITIATED,
            }
        });

        //Return the response
        return res.status(200).json({
            status: 'success',
            data: {
                txnToken: txnToken,
            },
            message: 'Order initiated successfully',
        });

    }

}