import {Request, Response} from "express";
import prisma from "../../config/database";

export default class CartSummaryController {
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

        const cartProducts = await prisma.cartProducts.findMany({
            where: {
                userId: uid,
            },
            include: {
                product: true,
            }
        });

        const totalProducts = cartProducts.length;

        const subTotal = cartProducts.reduce((acc, cartProduct) => {
            return acc + (cartProduct.product.mrp! * cartProduct.quantity);
        }, 0);

        const discountedTotal = cartProducts.reduce((acc, cartProduct) => {
            return acc + (cartProduct.product.saleRate! * cartProduct.quantity);
        }, 0);

        const deliveryCharge = 0;

        const orderTotal = discountedTotal + deliveryCharge;

        return res.status(200).json({
            status: 'success',
            data: {
                totalProducts: totalProducts,
                subTotal: subTotal,
                discountedTotal: discountedTotal,
                deliveryCharge: deliveryCharge,
                orderTotal: orderTotal,
            }
        });
    }
}