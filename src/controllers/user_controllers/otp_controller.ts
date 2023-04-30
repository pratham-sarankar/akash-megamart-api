import {Request, Response} from 'express';
import TokenController from "../security_controllers/token_controller";
import HashingController from "../security_controllers/hashing_controller";
import {JwtPayload} from "jsonwebtoken";
import prisma from "../../config/database";

export default class OtpController {
    static generateOtp(): string {
        const digits = '0123456789';
        let otp = '';

        for (let i = 0; i < 6; i++) {
            otp += digits[Math.floor(Math.random() * 10)];
        }

        return otp;
    }

    //
    // static async verifyOtp(req: Request, res: Response) {
    //     //Check Required Fields - verificationCode, otp
    //     const {verificationCode} = req.body;
    //     const otp = req.body.otp;
    //     if (!verificationCode || !otp) {
    //         return res.status(400).json({
    //             status: 'error',
    //             data: null,
    //             message: 'Verification Code and OTP are required parameters'
    //         });
    //     }
    //
    //     //Verify verification code
    //     try {
    //         await TokenController.verifyToken(verificationCode);
    //     } catch (e: any) {
    //         return res.status(400).json({
    //             status: 'error',
    //             data: null,
    //             message: 'Invalid or expired verification code'
    //         });
    //     }
    //
    //     const decodedToken: JwtPayload | null = await TokenController.decodeToken(verificationCode);
    //     if (!decodedToken) {
    //         return res.status(400).json({
    //             status: 'error',
    //             data: null,
    //             message: 'Invalid or expired verification code'
    //         });
    //     }
    //
    //     const payload = decodedToken.payload;
    //
    //     //Verify OTP
    //     const isOtpValid = await HashingController.compareHash(otp, payload.otp);
    //     if (!isOtpValid) {
    //         return res.status(400).json({
    //             status: 'error',
    //             data: null,
    //             message: 'Invalid OTP'
    //         });
    //     }
    //
    //     //Create or find user
    //     const whereClause: { [key: string]: any } = {};
    //     const defaults: { [key: string]: any } = {};
    //     if (payload.contactNumber) {
    //         whereClause.contactNumber = payload.contactNumber;
    //         defaults.contactNumber = payload.contactNumber;
    //         defaults.isContactNumberVerified = true;
    //     }
    //     if (payload.email) {
    //         whereClause.email = payload.email;
    //         defaults.email = payload.email;
    //         defaults.isEmailVerified = true;
    //     }
    //     if (payload.password) {
    //         defaults.password = payload.password;
    //     }
    //
    //     const [user, created] = await User.findOrCreate({
    //         where: whereClause,
    //         defaults: defaults
    //     });
    //
    //     //Update user
    //     if (!created) {
    //         if (payload.contactNumber) {
    //             user.isContactNumberVerified = true;
    //         }
    //         if (payload.email) {
    //             user.isEmailVerified = true;
    //         }
    //         await user.save();
    //     }
    //
    //     //Generate access token and refresh token
    //     const accessToken = TokenController.generateAccessToken(user.id);
    //     const refreshToken = TokenController.generateRefreshToken(user.id);
    //
    //     //Update refresh token in database
    //     user.refreshToken = refreshToken;
    //     await user.save();
    //
    //     return res.status(200).json({
    //         status: 'success',
    //         data: {
    //             accessToken,
    //             refreshToken,
    //         },
    //         message: 'User signed in successfully'
    //     })
    // }

    static async verifyOtp(req: Request, res: Response) {
        //Check Required Fields - verificationCode, otp
        const {verificationCode} = req.body;
        const otp = req.body.otp;
        if (!verificationCode || !otp) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: 'Verification Code and OTP are required parameters',
            });
        }

        //Verify verification code
        try {
            await TokenController.verifyToken(verificationCode);
        } catch (e: any) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: 'Invalid or expired verification code',
            });
        }

        const decodedToken = await TokenController.decodeToken(verificationCode);
        if (!decodedToken) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: 'Invalid or expired verification code',
            });
        }

        const payload = decodedToken.payload as JwtPayload;

        //Verify OTP
        const isOtpValid = await HashingController.compareHash(otp, payload.otp);
        if (!isOtpValid) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: 'Invalid OTP',
            });
        }

        //Create or find user
        let user = await prisma.users.findFirst({
            where: {
                OR: [
                    {
                        email: payload.email,
                    },
                    {
                        contactNumber: payload.contactNumber,
                    },
                ],
            },
        });


        if (!user) {
            user = await prisma.users.create({
                data: {
                    email: payload.email,
                    contactNumber: payload.contactNumber,
                    password: payload.password,
                    isEmailVerified: !!payload.email,
                    isContactNumberVerified: !!payload.contactNumber,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });
        } else {
            if (payload.email) {
                await prisma.users.update({
                    where: {
                        email: payload.email,
                    },
                    data: {
                        isEmailVerified: true,
                    },
                });
            }
            if (payload.contactNumber) {
                await prisma.users.update({
                    where: {
                        contactNumber: payload.contactNumber,
                    },
                    data: {
                        isContactNumberVerified: true,
                    },
                });
            }
        }

        //Generate access token and refresh token
        const accessToken = TokenController.generateAccessToken(user.id);
        const refreshToken = TokenController.generateRefreshToken(user.id);

        //Update refresh token in database
        await prisma.users.update({
            where: {
                id: user.id,
            },
            data: {
                refreshToken: refreshToken,
            },
        });

        return res.status(200).json({
            status: 'success',
            data: {
                accessToken,
                refreshToken,
            },
            message: 'User signed in successfully',
        });
    }
}

