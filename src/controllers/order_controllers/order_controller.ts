import {Request, Response} from "express";
import prisma from "../../config/database";

export default class OrderController {
    public static async fetch(req: Request, res: Response) {
        //Check if uid is provided
        const uid: number = Number(req.headers.uid);

        if (!uid) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: 'Invalid or missing uid',
            });
        }

        //Get cart items
        const orders = await prisma.orders.findMany({
            where: {
                userId: uid,
            },
            include: {
                orderItems: true,
                address: true,
            }
        });

        return res.status(200).json({
            status: 'success',
            data: {
                orders: orders,
            },
            message: 'Cart items fetched successfully',
        });
    }
}