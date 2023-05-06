import {NextFunction, Request, Response} from 'express';
import HashingController from "../../security_controllers/hashing_controller";
import ValidationController from "../../security_controllers/validation_controller";
import prisma from "../../../config/database";

export default class UserProfileController {
    public static async getProfile(req: Request, res: Response) {
        //Get user id from request
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

        //Return user profile
        return res.status(200).json({
            status: 'success',
            data: {
                user: user
            },
            message: 'User profile retrieved successfully.'
        });
    }

    public static async updateProfile(req: Request, res: Response, next: NextFunction) {
        try {
            //Body validation
            //If email is provided, validate it
            if (req.body.email) {
                try {
                    await ValidationController.validateEmail(req.body.email);
                } catch (e: any) {
                    return res.status(400).json({
                        status: 'error',
                        data: null,
                        message: e.message
                    });
                }
            }
            //if the contact number is provided, validate it
            if (req.body.contactNumber) {
                try {
                    await ValidationController.validateContactNumber(req.body.contactNumber);
                } catch (e: any) {
                    return res.status(400).json({
                        status: 'error',
                        data: null,
                        message: e.message
                    });
                }
            }

            //If the date of birth is provided, validate it
            if (req.body.dateOfBirth) {
                try {
                    await ValidationController.validateDate(req.body.dateOfBirth);
                } catch (e: any) {
                    return res.status(400).json({
                        status: 'error',
                        data: null,
                        message: e.message
                    });
                }
            }

            //Get user id from request
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

            //Update user profile
            //Check if displayName is provided
            if (req.body.displayName && user.displayName != req.body.displayName) {
                user.displayName = req.body.displayName;
            }
            //Check is username is provided
            if (req.body.username && user.username != req.body.username) {
                const userExists = await prisma.users.findUnique({
                    where: {
                        username: req.body.username
                    },
                });

                if (userExists) {
                    return res.status(400).json({
                        status: 'error',
                        data: null,
                        message: 'Username already exists.'
                    });
                }
                user.username = req.body.username;
            }
            //Check if date of birth is provided
            if (req.body.dateOfBirth && user.dateOfBirth != req.body.dateOfBirth) {
                user.dateOfBirth = new Date(req.body.dateOfBirth);
            }
            //Check if email is provided
            if (req.body.email && user.email != req.body.email) {
                const userExists = await prisma.users.findUnique({
                    where: {
                        email: req.body.email
                    },
                });
                if (userExists) {
                    return res.status(400).json({
                        status: 'error',
                        data: null,
                        message: 'Email already exists.'
                    });
                }
                user.isEmailVerified = false;
                user.email = req.body.email;
            }
            //Check if contact number is provided
            if (req.body.contactNumber && user.contactNumber != req.body.contactNumber) {
                const userExists = await prisma.users.findUnique({
                    where: {
                        contactNumber: req.body.contactNumber,
                    },
                });
                if (userExists) {
                    return res.status(400).json({
                        status: 'error',
                        data: null,
                        message: 'Contact number already exists.'
                    });
                }
                user.isContactNumberVerified = false;
                user.contactNumber = req.body.contactNumber;
            }

            //Save changes
            await prisma.users.update({
                where: {
                    id: uid
                },
                data: user
            });

            //Return user profile
            return res.status(200).json({
                status: 'success',
                data: {
                    user: user
                },
                message: 'User profile updated successfully.'
            });
        } catch (e) {
            next(e);
        }
    }

    public static async updatePassword(req: Request, res: Response) {
        //Get user id from request
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

        //Check if password is provided
        if (!req.body.password) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: 'Password is required parameter.'
            });
        }

        //Check if new password is provided
        if (!req.body.newPassword) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: 'New password is required parameter.'
            });
        }

        //Check if password is correct
        const isPasswordCorrect = await HashingController.compareHash(req.body.password, user.password as string);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                status: 'error',
                data: null,
                message: 'Incorrect password.'
            });
        }

        //Check if new password is same as old password
        if (req.body.password == req.body.newPassword) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: 'New password cannot be same as old password.'
            });
        }

        //Validate new password
        try {
            await ValidationController.validatePassword(req.body.newPassword);
        } catch (e: any) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: e.message
            });
        }

        //Update password
        user.password = await HashingController.hash(req.body.newPassword);
        await prisma.users.update({
            where: {
                id: uid
            },
            data: user
        });


        //Fetch the user again
        const updatedUser = await prisma.users.findUnique({
            where: {
                id: uid
            },
        });

        //Return user profile
        return res.status(200).json({
            status: 'success',
            data: {
                user: updatedUser
            },
            message: 'User password updated successfully.'
        });
    }


}