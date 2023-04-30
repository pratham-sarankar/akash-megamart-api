import {Request, Response} from "express";
import ValidationController from "../../security_controllers/validation_controller";
import TokenController from "../../security_controllers/token_controller";
import HashingController from "../../security_controllers/hashing_controller";
import OtpController from "../otp_controller";
import {PublishResponse} from "aws-sdk/clients/sns";
import SMSController from "../../communication_controllers/sms_controller";
import MailController from "../../communication_controllers/mail_controller";
import {SentMessageInfo} from "nodemailer";
import prisma from "../../../config/database";

export default class UserSignUpController {

    public static async signUpWithEmailAndPassword(req: Request, res: Response) {
        //Check Required Fields - email, password
        const email = req.body.email;
        const password = req.body.password;
        if (!email || !password) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: 'Email and Password are required parameters'
            });
        }

        //Validate Email and Password
        try {
            await ValidationController.validateEmail(email);
            await ValidationController.validatePassword(password);
        } catch (e: any) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: e.message
            });
        }

        //Check if email exists
        const user = await prisma.users.findUnique({
            where: {
                email: email
            }
        });
        if (user) {
            return res.status(409).json({
                status: 'error',
                data: null,
                message: "User already exists, please sign in."
            });
        }


        //Create verification code
        const otp = OtpController.generateOtp();
        const hashedOtp = await HashingController.hash(otp);
        const hashedPassword = await HashingController.hash(password);
        const verificationCode = TokenController.createVerificationCode({
            email: email,
            password: hashedPassword,
            otp: hashedOtp
        });

        //Send verification code
        try {
            const response: SentMessageInfo = await MailController.sendOtp(email, otp);
        } catch (e: any) {
            return res.status(500).json({
                status: 'error',
                data: null,
                message: e.message
            });
        }

        return res.status(200).json({
            status: 'success',
            data: {
                verificationCode
            }
        });
    }

    public static async signUpWithContactNumber(req: Request, res: Response) {
        //Check Required Fields - contactNumber
        const {contactNumber} = req.body;
        if (!contactNumber) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: 'Contact number is required parameter'
            });
        }

        //Validate Contact Number
        try {
            await ValidationController.validateContactNumber(contactNumber);
        } catch (e: any) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: e.message
            });
        }

        //Check if contact number exists
        const user = await prisma.users.findUnique({
            where: {
                contactNumber: contactNumber,
            },
        });
        if (user) {
            return res.status(409).json({
                status: 'error',
                data: null,
                message: "User already exists, please sign in.",
            });
        }

        //Create verification code
        const otp = OtpController.generateOtp();
        const hashedOtp = await HashingController.hash(otp);
        const verificationCode = TokenController.createVerificationCode({
            contactNumber,
            otp: hashedOtp
        });


        //Send verification code
        try {
            const response: PublishResponse = await SMSController.sendOtp(contactNumber, otp);
        } catch (e: any) {
            return res.status(500).json({
                status: 'error',
                data: null,
                message: e.message
            });
        }

        //Return verification code
        return res.status(200).json({
            status: 'success',
            data: {
                verificationCode
            },
            message: 'Verification code sent successfully.'
        });
    }
}