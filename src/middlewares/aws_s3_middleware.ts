import * as fs from 'fs';
import s3 from '../config/aws_s3';
import * as util from 'util';
import {NextFunction, Request, Response} from "express";

const unlinkFile = util.promisify(fs.unlink);


export default class AwsS3Middleware {
    public static async uploader(req: Request, res: Response, next: NextFunction) {
        if (!req.file) {
            return res.status(400).json({status: 'error', data: null, message: 'No file uploaded.'},);
        }
        try {
            const fileStream = fs.createReadStream(req.file.path);
            const uploadParams = {
                Bucket: process.env.AWS_BUCKET_NAME!,
                Body: fileStream,
                Key: req.file.filename
            };
            const result = await s3.upload(uploadParams).promise();
            await unlinkFile(req.file.path);

            req.headers.key = result.Key;
            next();
        } catch (e) {
            res.status(500).json({status: 'error', data: e, message: 'An error occurred in s3 middleware.'});
        }
    }


    public static async downloader(req: any, res: any, next: any): Promise<void> {
        try {
            const key = req.params.key;
            const downloadParams = {
                Key: key,
                Bucket: process.env.AWS_BUCKET_NAME!,
            };
            req.stream = await s3.getObject(downloadParams).createReadStream();
            next();
        } catch (e) {
            res.status(500).json({status: 'error', data: e, message: 'An error occurred in s3 middleware.'});
        }
    }

    public static async delete(key: string): Promise<boolean> {
        try {
            const deleteParams = {
                Key: key,
                Bucket: process.env.AWS_BUCKET_NAME!,
            };
            await s3.deleteObject(deleteParams).promise();
            return true;
        } catch (e) {
            return false;
        }
    }
}