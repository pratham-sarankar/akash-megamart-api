import {Request, Response} from 'express';
import TokenController from "../security_controllers/token_controller";
import HashingController from "../security_controllers/hashing_controller";
import User from "../../models/user";
import {JwtPayload} from "jsonwebtoken";

export default class OtpController {
    static generateOtp(): string {
        const digits = '0123456789';
        let otp = '';

        for (let i = 0; i < 6; i++) {
            otp += digits[Math.floor(Math.random() * 10)];
        }

        return otp;
    }

    static async verifyOtp(req: Request, res: Response) {
        //Check Required Fields - verificationCode, otp
        const verificationCode = req.body.verification_code;
        const otp = req.body.otp;
        if (!verificationCode || !otp) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: 'Verification Code and OTP are required parameters'
            });
        }

        //Verify verification code
        try {
            await TokenController.verifyToken(verificationCode);
        } catch (e: any) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: 'Invalid or expired verification code'
            });
        }

        const decodedToken: JwtPayload | null = await TokenController.decodeToken(verificationCode);
        if (!decodedToken) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: 'Invalid or expired verification code'
            });
        }

        const payload = decodedToken.payload;

        //Verify OTP
        const isOtpValid = await HashingController.compareHash(otp, payload.otp);
        if (!isOtpValid) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: 'Invalid OTP'
            });
        }

        //Create or find user
        const whereClause: { [key: string]: any } = {};
        const defaults: { [key: string]: any } = {};
        if (payload.contact_number) {
            whereClause.contact_number = payload.contact_number;
            defaults.contact_number = payload.contact_number;
            defaults.is_contact_number_verified = true;
        }
        if (payload.email) {
            whereClause.email = payload.email;
            defaults.email = payload.email;
            defaults.is_email_verified = true;
        }
        if (payload.password) {
            defaults.password = payload.password;
        }

        const [user, created] = await User.findOrCreate({
            where: whereClause,
            defaults: defaults
        });

        //Generate access token and refresh token
        const accessToken = TokenController.generateAccessToken(user.id);
        user.refreshToken = TokenController.generateRefreshToken(user.id);

        //Update refresh token in database
        await user.save();

        return res.status(200).json({
            status: 'success',
            data: {
                access_token: accessToken,
                refresh_token: user.refreshToken,
                user: user,
            },
            message: 'User signed in successfully'
        })
    }
}

