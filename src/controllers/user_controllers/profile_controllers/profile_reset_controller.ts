import {Request, Response} from 'express';
import ValidationController from "../../security_controllers/validation_controller";
import HashingController from "../../security_controllers/hashing_controller";
import prisma from "../../../config/database";

export default class ProfileResetController {
    public static async resetPassword(req: Request, res: Response) {
        try {
            //Check if uid is provided
            const uid: number = Number(req.headers.uid);

            if (!uid) {
                return res.status(400).json({
                    status: 'error',
                    data: null,
                    message: 'Invalid or missing uid',
                });
            }

            //Check if password is provided.
            const password: string = req.body.password;

            if (!password) {
                return res.status(400).json({
                    status: 'error',
                    data: null,
                    message: 'Invalid or missing password',
                });
            }

            //Validate the password
            try {
                await ValidationController.validatePassword(password);
            } catch (e: any) {
                return res.status(400).json({
                    status: 'error',
                    data: null,
                    message: e.message,
                });
            }

            //Hash the password
            const hashedPassword = await HashingController.hash(password);

            //Update the user's password
            await prisma.users.update({
                where: {
                    id: uid,
                },
                data: {
                    password: hashedPassword,
                }
            });
            return res.status(200).json({
                status: 'success',
                data: null,
                message: 'Password reset successfully.',
            });
        } catch (e) {
            return res.status(500).json({
                status: 'error',
                data: null,
                message: 'An error occurred while resetting the password.',
            });
        }
    }
}