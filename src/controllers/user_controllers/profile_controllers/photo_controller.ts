import {Request, Response} from 'express';
import AwsS3Middleware from "../../../middlewares/aws_s3_middleware";
import prisma from "../../../config/database";

export default class UserPhotoController {
    public static async uploadPhoto(req: Request, res: Response) {
        const uid: number = Number(req.headers.uid);

        //Get user from database
        const user = await prisma.users.findUnique({
            where: {
                id: uid
            },
        });

        //If user does not exist, return error
        if (!user) {
            return res.status(404).json({
                status: 'error',
                data: null,
                message: 'Invalid token entered or user has been deleted.'
            });
        }

        //If user exists, update the photo
        //Check if the key exists in the headers
        const key: string = req.headers.key as string;
        if (!req.headers.key) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: 'Key is not provided. It indicates an error while uploading the photo.'
            });
        }

        //Check if the key exists in the database
        if (user.photoKey) {
            //Delete the old photo
            const deleted = await AwsS3Middleware.delete(user.photoKey);
            if (!deleted) {
                return res.status(500).json({
                    status: 'error',
                    data: null,
                    message: 'Error while deleting the old photo.'
                });
            }
        }

        //Update the photo key
        user.photoKey = key;

        //Save user
        await prisma.users.update({
            where: {
                id: uid
            },
            data: user
        });

        return res.status(200).json({
            status: 'success',
            data: {
                user: user
            },
            message: 'Photo uploaded successfully.'
        });
    }
}