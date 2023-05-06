import {Request, Response} from 'express';
import prisma from "../../config/database";

export default class CartController {
    static async fetch(req: Request, res: Response) {
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
        const cartProducts = await prisma.cartProducts.findMany({
            where: {
                userId: uid,
            },
            include: {
                product: true,
            }
        });

        return res.status(200).json({
            status: 'success',
            data: {
                cartProducts: cartProducts,
            },
            message: 'Cart items fetched successfully',
        });
    }

    static async add(req: Request, res: Response) {
        //Check required parameters - product id, quantity
        const productId: number = Number(req.body.productId);
        const quantity: number = Number(req.body.quantity ?? 1);

        //If product id is not provided, return error
        if (!productId) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: 'Invalid or missing product id',
            });
        }

        //Check if uid is provided
        const uid: number = Number(req.headers.uid);

        if (!uid) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: 'Invalid or missing uid',
            });
        }

        //Check if product exists
        const product = await prisma.products.findUnique({
            where: {
                id: productId,
            }
        });

        if (!product) {
            return res.status(404).json({
                status: 'error',
                data: null,
                message: 'Product not found',
            });
        }

        //Check if product is already in cart
        const cartItem = await prisma.cartProducts.findFirst({
            where: {
                productId: productId,
                userId: uid,
            }
        });

        //If product is already in cart, update quantity
        if (cartItem) {
            const result = await prisma.cartProducts.update({
                where: {
                    id: cartItem.id,
                },
                data: {
                    quantity: cartItem.quantity + quantity,
                }
            });

            const updatedCartItem = await prisma.cartProducts.findUnique({
                where: {
                    id: cartItem.id,
                },
                include: {
                    product: true,
                }
            });

            return res.status(200).json({
                status: 'success',
                data: {
                    cartProduct: updatedCartItem,
                },
                message: 'Product added to cart successfully',
            });
        }

        //If product is not in cart, add product to cart
        const result = await prisma.cartProducts.create({
            data: {
                productId: productId,
                userId: uid,
                quantity: quantity,
            },
            include: {
                product: true,
            }
        });

        return res.status(200).json({
            status: 'success',
            data: {
                cartProduct: result,
            },
            message: 'Product added to cart successfully',
        });
    }

    static async update(req: Request, res: Response) {
        //Check required parameters - id & quantity
        const id = req.params.id;
        const quantity = req.body.quantity;

        if (!id) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: 'Invalid or missing product id',
            });
        }
        if (!quantity) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: 'quantity is a required parameter',
            });
        }

        //Check if uid is provided
        const uid: number = Number(req.headers.uid);

        if (!uid) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: 'Invalid or missing uid',
            });
        }

        //Check if product exists
        const product = await prisma.products.findUnique({
            where: {
                id: Number(id),
            }
        });

        if (!product) {
            return res.status(404).json({
                status: 'error',
                data: null,
                message: 'Product not found',
            });
        }

        //Check if product is already in cart
        const cartItem = await prisma.cartProducts.findFirst({
            where: {
                productId: Number(id),
            }
        });

        //If product is not in cart, return error
        if (!cartItem) {
            return res.status(404).json({
                status: 'error',
                data: null,
                message: 'Product not found in cart',
            });
        }

        //If product is in cart, update quantity
        const result = await prisma.cartProducts.update({
            where: {
                id: cartItem.id,
            },
            include: {
                product: true,
            },
            data: {
                quantity: Number(quantity),
            }
        });

        return res.status(200).json({
            status: 'success',
            data: {
                cartProduct: result,
            },
            message: 'Product quantity updated successfully',
        });
    }

    static async remove(req: Request, res: Response) {
        //Check required parameters - id
        const id = req.params.id;

        if (!id) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: 'Invalid or missing product id',
            });
        }

        //Check if uid is provided
        const uid: number = Number(req.headers.uid);

        if (!uid) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: 'Invalid or missing uid',
            });
        }

        //Check if product exists
        const product = await prisma.products.findUnique({
            where: {
                id: Number(id),
            }
        });

        if (!product) {
            return res.status(404).json({
                status: 'error',
                data: null,
                message: 'Product not found',
            });
        }

        //Check if product is already in cart
        const cartItem = await prisma.cartProducts.findFirst({
            where: {
                productId: Number(id),
                userId: uid,
            }
        });

        //If product is not in cart, return error
        if (!cartItem) {
            return res.status(404).json({
                status: 'error',
                data: null,
                message: 'Product not found in cart',
            });
        }

        //If product does not belong to user, return error
        if (cartItem.userId !== uid) {
            console.log(cartItem.userId, uid);
            return res.status(403).json({
                status: 'error',
                data: null,
                message: 'Product does not belong to user',
            });
        }

        //If product is in cart, remove product from cart
        await prisma.cartProducts.delete({
            where: {
                id: cartItem.id,
            }
        });

        return res.status(200).json({
            status: 'success',
            data: null,
            message: 'Product removed from cart successfully',
        });
    }
}