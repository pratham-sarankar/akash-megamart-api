import {Request, Response} from "express";
import ValidationController from "../security_controllers/validation_controller";
import User from "../../models/user";
import OtpController from "./otp_controller";
import HashingController from "../security_controllers/hashing_controller";
import SMSController from "../communication_controllers/sms_controller";
import {PublishResponse} from "aws-sdk/clients/sns";
import TokenController from "../security_controllers/token_controller";

export default class UserSignInController {
    public static async signInWithEmailAndPassword(req: Request, res: Response) {
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

        //Validate Email
        try {
            await ValidationController.validateEmail(email);
        } catch (e: any) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: e.message
            });
        }

        //Check if email exists
        const user = await User.findOne({
            where: {
                email: email
            }
        });
        if (!user) {
            return res.status(404).json({
                status: 'error',
                data: null,
                message: 'User does not exist, please sign up.'
            });
        }

        //Check if password exists
        if (!user.password) {
            return res.status(404).json({
                status: 'error',
                data: null,
                message: 'Password does not exist, please sign in with contact number.'
            });
        }

        //Check if password is correct
        const isPasswordCorrect = await HashingController.compareHash(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                status: 'error',
                data: null,
                message: 'Incorrect password.'
            });
        }

        //Generate Access Token and Refresh Token
        const accessToken = TokenController.generateAccessToken(user.id);
        user.refreshToken = TokenController.generateRefreshToken(user.id);

        //Update Refresh Token in database
        await user.save();

        return res.status(200).json({
            status: 'success',
            data: {
                access_token: accessToken,
                refresh_token: user.refreshToken
            }
        });
    }

    public static async signInWithContactNumber(req: Request, res: Response) {
        //Check Required Fields - contact_number
        const contactNumber = req.body.contact_number;
        if (!contactNumber) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: 'Contact number is required parameter'
            });
        }

        //Validate Contact Number and password
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
        const user = await User.findOne({
            where: {
                contact_number: contactNumber
            }
        });
        if (!user) {
            return res.status(404).json({
                status: 'error',
                data: null,
                message: 'User does not exist, please sign up.'
            });
        }

        //Generate verification code
        const otp = OtpController.generateOtp();
        const hashedOtp = await HashingController.hash(otp);
        const verificationCode = TokenController.createVerificationCode({
            contact_number: contactNumber,
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

        //Send response
        return res.status(200).json({
            status: 'success',
            data: {
                verification_code: verificationCode
            },
            message: 'Verification code sent successfully.'
        });
    }
}