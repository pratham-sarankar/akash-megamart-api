import {Request, Response} from 'express';
import User from "../../../models/user_models/user";

export default class UserAddressController {
    public static async addAddress(req: Request, res: Response) {
        //Check required parameters - line1, contactNumber
        const {line1, contactNumber} = req.body;
        if (!line1 || !contactNumber) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: 'Line 1 and contact number are required parameters.'
            });
        }

        //Get user id from request
        const uid: number = Number(req.headers.uid);

        //Get user from database
        const user = await User.scope('public').findByPk(uid);

        //If user does not exist, return error
        if (!user) {
            return res.status(404).json({
                status: 'error',
                data: null,
                message: 'Invalid token entered or user has been deleted.'
            });
        }


    }
}