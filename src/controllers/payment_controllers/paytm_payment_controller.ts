import {Request, Response} from "express";
import prisma from "../../config/database";

export default class PaytmPaymentController {
    public static async initiateTransaction(req: Request, res: Response) {


        //Check if uid is provided
        const uid: number = Number(req.headers.uid);

        if (!uid) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: 'Invalid or missing uid',
            });
        }

        //Get user details
        const user = await prisma.users.findUnique({
            where: {
                id: uid,
            }
        });

        //Check if user exists
        if (!user) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: 'User not found',
            });
        }


        const callbackUrl = req.body.HOST + "/payment/paytm/callback";
        let paytmParams = {
            "requestType": "Payment",
            "mid": process.env.PAYTM_MERCHANT_ID,
            "websiteName": process.env.PAYTM_WEBSITE_NAME,
            "orderId": "ORDERID_98765",
            "callbackUrl": callbackUrl,
            "txnAmount": {
                "value": "1.00",
                "currency": process.env.PAYTM_CURRENCY,
            },
            "userInfo": {
                "custId": "1",
            },
        };


    }
}