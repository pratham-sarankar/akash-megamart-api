import {Request, Response} from "express";
import * as fs from "fs";
import AWS from 'aws-sdk';
import prisma from "../../config/database";
import s3 from "../../config/aws_s3";

export default class ImageController {

    public static async stream(req: Request, res: Response) {
        const key = req.url;

        // Set up the parameters for streaming the file
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: key,
        } as any;

        // Stream the file from S3
        const stream = s3.getObject(params).createReadStream();

        stream.on('error', (err) => {
            console.error('Error streaming file:', err);
            res.status(500).send('Error streaming file');
        });

        // Set the appropriate headers for the response
        res.setHeader('Content-Disposition', `attachment; filename="${key}"`);

        // Pipe the file stream to the response
        stream.pipe(res);
    }

    public static async upload(req: Request, res: Response) {
        const imagesData = JSON.parse(fs.readFileSync("csvjson.json", 'utf-8'));

        const s3 = new AWS.S3();
        const timestamp = Date.now().toString();

        let result = [];

        result.push({
            imageLength: imagesData.length,
        })

        let i = 0;
        for (const imageData of imagesData) {
            console.log(`Uploading ${i}/${imagesData.length}...`);
            i++;
            let log: any = {};
            const {productId, imageKey} = imageData;
            if (imageKey === '') continue;
            log.productId = productId;
            log.imageKey = imageKey;

            const product = await prisma.products.findUnique({
                where: {
                    id: productId,
                }
            });
            if (!product) {
                log.productExists = false;
                result.push(log);
                continue;
            }
            log.productExists = true;

            const path = `uploads/product/${imageKey}`;
            const folderName = `product_${productId}`;

            const imageBuffer = fs.readFileSync(path);
            const s3Key = `${folderName}/${timestamp}.jpg`;

            const params = {
                Bucket: process.env.AWS_BUCKET_NAME!,
                Key: s3Key,
                Body: imageBuffer,
            };

            await s3.upload(params).promise();
            const res = await prisma.images.create({
                data: {
                    imageKey: s3Key,
                    productId: product.id,
                }
            });
            log.createResult = res;
            result.push(log);

        }

        console.log('All images uploaded successfully!');

        return res.status(200).json({
            status: "success",
            data: result,
            message: "All images uploaded successfully!"
        })
    }


}