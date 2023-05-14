import {Request, Response} from 'express';
import axios from "axios";
import MargERPEncryption from "../../config/marg";
import ProductController from "../product_controllers/product_controller";
import prisma from "../../config/database";
import CompanyController from "../company_controllers/company_controller";

export default class SyncController {
    public static async sync(req: Request, res: Response) {
        const lastSyncDate = await SyncController.getLastSyncDate();

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
                    "Datetime": lastSyncDate,
                    "index": "0"
                },
            });
            const result: any = MargERPEncryption.decodeAndDecompress(response.data);

            const syncProductsResult = await SyncController.syncProducts(result);
            const syncCompanies = await SyncController.syncCompanies(result);

            await SyncController.setLastSyncDate(new Date());

            return res.status(200).json({
                status: 'success',
                data: {
                    summary: {
                        products: syncProductsResult,
                        companies: syncCompanies,
                    }
                }
            });
        } catch (e: any) {
            return res.status(500).json({
                status: 'error',
                data: e,
                message: e.message
            });
        }

    }

    private static async getLastSyncDate() {
        let lastSyncDate = process.env.MargERP_Last_Sync_Date;

        if (lastSyncDate == undefined) {
            lastSyncDate = '';
        }

        return lastSyncDate;
    }

    private static async setLastSyncDate(lastSyncDate: Date) {
        process.env.MargERP_Last_Sync_Date = lastSyncDate.toISOString();
    }


    private static async syncProducts(result: any) {
        //Sync new products
        let newProducts = ProductController.parseMargProductsData((result['Details']['pro_N'] ?? []) as any);

        await prisma.products.createMany({
            data: newProducts,
            skipDuplicates: true
        });

        //Sync updated products
        let updatedProducts = ProductController.parseMargProductsData((result['Details']['pro_U'] ?? []) as any);

        for (let product of updatedProducts) {
            await prisma.products.update({
                where: {
                    id: product.id
                },
                data: product
            });
        }

        //Sync stock updated products
        let stockUpdatedProducts = ProductController.parseMargProductsData((result['Details']['pro_S'] ?? []) as any);
        for (let i = 0; i < stockUpdatedProducts.length; i++) {
            let current = await prisma.products.findFirst({
                where: {
                    code: stockUpdatedProducts[i].code
                }
            });
            if (current == null) continue;
            current.stock = stockUpdatedProducts[i].stock;

            await prisma.products.update({
                where: {
                    id: current.id
                },
                data: current
            });

            stockUpdatedProducts[i] = current as any;
        }


        //Sync rate updated products
        let rateUpdatedProducts = ProductController.parseMargProductsData((result['Details']['pro_R'] ?? []) as any);

        for (let i = 0; i < rateUpdatedProducts.length; i++) {
            let current = await prisma.products.findFirst({
                where: {
                    code: rateUpdatedProducts[i].code
                }
            });
            if (current == null) continue;
            current.mrp = stockUpdatedProducts[i].mrp;
            current.saleRate = stockUpdatedProducts[i].saleRate;

            await prisma.products.update({
                where: {
                    id: current.id
                },
                data: current
            });

            stockUpdatedProducts[i] = current as any;
        }

        return {
            new: {
                total: newProducts.length,
                // data: newProducts,
            },
            updated: {
                total: updatedProducts.length,
                // data: updatedProducts,
            },
            stockUpdated: {
                total: stockUpdatedProducts.length,
                // data: stockUpdatedProducts,
            },
            rateUpdated: {
                total: rateUpdatedProducts.length,
                // data: rateUpdatedProducts,
            }
        }
    }


    private static async syncCompanies(result: any) {
        //Sync Companies
        let companies = CompanyController.parseMargData((result['Details']['Stype'] ?? []) as any);

        for (let company of companies) {
            await prisma.companies.upsert({
                where: {
                    id: company.id
                },
                update: company,
                create: company
            });
        }

        return {
            total: companies.length,
            // data: companies,
        }
    }
}