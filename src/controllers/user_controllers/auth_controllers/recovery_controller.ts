import {Request, Response} from 'express'
import ValidationController from "../../security_controllers/validation_controller";
import MailController from "../../communication_controllers/mail_controller";
import OtpController from "../otp_controller";
import HashingController from "../../security_controllers/hashing_controller";
import TokenController from "../../security_controllers/token_controller";
import SMSController from "../../communication_controllers/sms_controller";
import prisma from "../../../config/database";

export default class UserRecoveryController {
    public static async recoverPassword(req: Request, res: Response) {
        //Check required fields - identity
        const identity = req.body.identity;
        if (!identity) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: 'Identity is a required parameter'
            });
        }

        //Check if identity is email or contact number
        try {
            //If identity contains @, it is an email address. So, check if its valid
            if (identity.includes('@')) {
                await ValidationController.validateEmail(identity);
            } else {
                //If identity does not contain @, it is a contact number. So, check if its valid
                await ValidationController.validateContactNumber(identity);
            }
        } catch (e: any) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: e.message
            });
        }

        //Find user by email or contact number
        const user = await prisma.users.findFirst({
            where: {
                OR: [
                    {email: identity},
                    {contactNumber: identity},
                ],
            },
        });

        //If user does not exist, return error
        if (!user) {
            return res.status(404).json({
                status: 'error',
                data: null,
                message: 'User does not exist'
            });
        }

        //Create new OTP
        const otp = OtpController.generateOtp();
        const otpHash = await HashingController.hash(otp);

        //Create data that should contain email or contactNumber according to identity
        const data: { otp: string, email?: string, contactNumber?: string } = {
            otp: otpHash,
        };
        if (identity.includes('@')) {
            data.email = identity;
        } else {
            data.contactNumber = identity;
        }
        const verificationCode = TokenController.createVerificationCode(data);


        //If user exists, send OTP to user's email address or contact number
        //If identity is email, send OTP to email address or contact number
        if (identity.includes('@')) {
            //Send OTP to email address
            await MailController.sendOtp(identity, otp);
        } else {
            //Sent OTP to contact number
            await SMSController.sendOtp(identity, otp);
        }

        //Return success response
        return res.status(200).json({
            status: 'success',
            data: {
                verificationCode
            },
        });
    }
}