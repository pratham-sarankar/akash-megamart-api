import {Request, Response} from "express";
import prisma from "../../config/database";

export default class WishlistController {
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

        //Get wishlist items
        const wishlistItems = await prisma.wishlistProducts.findMany({
            where: {
                userId: uid,
            },
            include: {
                product: true,
                user: true,
            } as any
        });

        return res.status(200).json({
            status: 'success',
            data: {
                wishlistProducts: wishlistItems,
            },
            message: 'Wishlist items fetched successfully',
        });
    }

    static async add(req: Request, res: Response) {
        //Check if uid is provided
        const uid: number = Number(req.headers.uid);

        if (!uid) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: 'Invalid or missing uid',
            });
        }

        //Check if product id is provided
        const productId: number = Number(req.body.productId);

        if (!productId) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: 'Invalid or missing product id',
            });
        }

        //Check if product exists
        const product = await prisma.products.findUnique({
            where: {
                id: productId,
            }
        });

        if (!product) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: 'Invalid product id',
            });
        }

        //Check if product is already in wishlist
        const wishlistItem = await prisma.wishlistProducts.findFirst({
            where: {
                userId: uid,
                productId: productId,
            }
        });

        if (wishlistItem) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: 'Product already in wishlist',
            });
        }

        //Add product to wishlist
        const newWishlistItem = await prisma.wishlistProducts.create({
            data: {
                userId: uid,
                productId: productId,
            },
            include: {
                product: true,
            }
        });

        return res.status(200).json({
            status: 'success',
            data: {
                wishlistProduct: newWishlistItem,
            },
            message: 'Product added to wishlist successfully',
        });
    }

    static async remove(req: Request, res: Response) {
        //Check if uid is provided
        const uid: number = Number(req.headers.uid);

        if (!uid) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: 'Invalid or missing uid',
            });
        }

        //Check if id is provided
        const id: number = Number(req.params.id);

        if (!id) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: 'Invalid or missing id',
            });
        }

        //Check if the wishlist item exists
        const wishlistItem = await prisma.wishlistProducts.findFirst({
            where: {
                productId: id,
                userId: uid,
            }
        });

        if (!wishlistItem) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: "Provided product id doesn't exist",
            });
        }

        //Check if the wishlist item belongs to the user
        if (wishlistItem.userId !== uid) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: 'This wishlist item does not belong to you',
            });
        }

        //Delete the wishlist item
        await prisma.wishlistProducts.delete({
            where: {
                id: wishlistItem.id,
            }
        });

        return res.status(200).json({
            status: 'success',
            data: null,
            message: 'Wishlist item deleted successfully',
        });
    }
}