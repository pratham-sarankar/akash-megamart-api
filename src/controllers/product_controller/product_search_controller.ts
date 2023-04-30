import {Request, Response} from "express";
import prisma from "../../config/database";

export default class ProductSearchController {
    public static async search(req: Request, res: Response) {
        const {q = '', page = 1, limit = 10} = req.query;

        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);

        const productsPromise = prisma.products.findMany({
            where: {
                name: {
                    contains: q.toString(),
                },
            },
            skip,
            take,
        });

        const totalCountPromise = prisma.products.count({
            where: {
                name: {
                    contains: q.toString(),
                },
            },
        });

        const [products, totalCount] = await Promise.all([
            productsPromise,
            totalCountPromise,
        ]);

        const totalPages = Math.ceil(totalCount / take);

        return res.json({products, totalCount, totalPages});
    }
}