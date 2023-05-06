import {Request, Response} from "express";
import prisma from "../../config/database";
import axios from "axios";
import MargERPEncryption from "../../config/marg";

export default class ProductController {
    public static async sync(req: Request, res: Response) {
        try {
            const response = await axios.request({
                method: 'post',
                maxBodyLength: Infinity,
                url: process.env.MargERP_Product_Endpoint,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    "CompanyCode": process.env.MargERP_Company_Name,
                    "MargID": process.env.MargERP_MargID,
                    "Datetime": "",
                    "index": "0"
                },
            });
            const result: any = MargERPEncryption.decodeAndDecompress(response.data);
            let products = ProductController.parseMargProductsData((result['Details']['pro_N'] ?? []) as any);
            products = products.filter((product: any) => product.company != "MARKET");
            await prisma.products.deleteMany({});
            await prisma.products.createMany({data: products, skipDuplicates: true});

            const count = await prisma.products.count({});

            return res.status(200).json({
                status: 'success',
                data: {
                    summary: {
                        total: count,
                    }
                },
                message: 'Products synced successfully'
            });

        } catch (e: any) {
            return res.status(500).json({
                status: 'error',
                data: e,
                message: e.message
            });
        }
    }

    private static parseMargProductsData(data: any) {
        const parsedData = (data as []).map((product: any) => {
            return {
                id: Number(product['rid']),
                catcode: product['catcode'],
                code: product['code'],
                name: product['name'],
                stock: Number(product['stock']),
                remark: product['remark'],
                company: product['company'],
                mrp: Number(product['MRP']),
                saleRate: Number(product['Rate']),
                deal: Number(product['Deal']),
                free: Number(product['Free']),
                purchaseRate: Number(product['PRate']),
            }
        });
        return parsedData;
    }


}