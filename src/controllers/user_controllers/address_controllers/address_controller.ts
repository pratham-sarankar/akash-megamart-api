import {NextFunction, Request, Response} from 'express';
import ValidationController from "../../security_controllers/validation_controller";
import prisma from "../../../config/database";
import {Prisma} from "@prisma/client";

export default class UserAddressController {
    public static async addAddress(req: Request, res: Response) {
        try {
            // Check required parameters - line1, contactNumber
            const {name, contactNumber, type, line1, line2, landmark, pinCode, isDefault} = req.body
            if (!line1 || !type) {
                return res.status(400).json({
                    status: 'error',
                    data: null,
                    message: 'Type and Line 1 are required parameters.',
                })
            }

            try {
                if (contactNumber) {
                    await ValidationController.validateContactNumber(contactNumber)
                }
                if (pinCode) {
                    await ValidationController.validatePincode(pinCode)
                }
            } catch (error: any) {
                if (error.code === 'P2002') {
                    return res.status(400).json({
                        status: 'error',
                        data: null,
                        message: 'Duplicate entry',
                    })
                }
                if (error instanceof Prisma.PrismaClientKnownRequestError) {
                    return res.status(400).json({
                        status: 'error',
                        data: null,
                        message: error.message,
                    })
                }
                throw error
            }

            // Get user id from request
            const uid: number = Number(req.headers.uid)

            // Get user from database
            const user = await prisma.users.findUnique({where: {id: uid}})

            // If user does not exist, return error
            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    data: null,
                    message: 'Invalid token entered or user has been deleted.',
                })
            }

            if (isDefault) {
                // Set all other addresses to false
                await prisma.addresses.updateMany({
                    where: {userId: uid},
                    data: {isDefault: false},
                })
            }

            // Create address
            const address = await prisma.addresses.create({
                data: {
                    name,
                    contactNumber,
                    type,
                    line1,
                    line2,
                    landmark,
                    pinCode,
                    isDefault,
                    userId: uid,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });

            // Send response
            return res.status(201).json({
                status: 'success',
                data: {
                    address: address,
                },
                message: 'Address added successfully.',
            })
        } catch (e: any) {
            return res.status(500).json({
                status: 'error',
                data: e,
                message: e.message,
            })
        }
    }

    public static async removeAddress(req: Request, res: Response) {
        // Check required parameters - id
        const {id} = req.params;
        if (!id) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: 'Id is required parameter.',
            });
        }

        // Check if uid is provided
        const uid: number = Number(req.headers.uid);
        // Get user from database
        const user = await prisma.users.findUnique({
            where: {
                id: uid,
            },
            select: {
                id: true,
            },
        });

        // If user does not exist, return error
        if (!user) {
            return res.status(404).json({
                status: 'error',
                data: null,
                message: 'Invalid token entered or user has been deleted.',
            });
        }

        // Get address from database
        const address = await prisma.addresses.findUnique({
            where: {
                id: Number(id),
            },
        });

        // If address does not exist, return error
        if (!address) {
            return res.status(404).json({
                status: 'error',
                data: null,
                message: 'Address not found.',
            });
        }

        // If address does not belong to user, return error
        if (address.userId !== uid) {
            return res.status(403).json({
                status: 'error',
                data: null,
                message: 'You are not authorized to remove this address.',
            });
        }

        // Remove address
        await prisma.addresses.delete({
            where: {
                id: Number(id),
            },
        });

        // Send response
        return res.status(200).json({
            status: 'success',
            data: null,
            message: 'Address removed successfully.',
        });
    }


    public static async getAllAddresses(req: Request, res: Response, next: NextFunction) {
        try {
            //Check if uid is provided
            const uid: number = Number(req.headers.uid);
            //Get user from database
            const user = await prisma.users.findUnique({
                where: {
                    id: uid,
                },
                select: {
                    id: true,
                    displayName: true,
                    email: true,
                    addresses: {
                        select: {
                            id: true,
                            name: true,
                            contactNumber: true,
                            type: true,
                            line1: true,
                            line2: true,
                            landmark: true,
                            pinCode: true,
                            isDefault: true,
                            createdAt: true,
                            updatedAt: true,
                        }
                    },
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

            //Get all addresses
            const addresses = user.addresses;

            //Send response
            return res.status(200).json({
                status: 'success',
                data: {
                    addresses: addresses
                },
                message: 'Addresses retrieved successfully.',
            });
        } catch (e) {
            next();
        }
    }

    public static async getAddress(req: Request, res: Response) {
        //Check required parameters - id
        const {id} = req.params;
        if (!id) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: 'Address id is required parameter.'
            });
        }

        //Check if uid is provided
        const uid: number = Number(req.headers.uid);
        //Get user from database
        const user = await prisma.users.findUnique({
            where: {
                id: uid
            },
            select: {
                id: true,
                displayName: true,
                email: true
            }
        });

        //If user does not exist, return error
        if (!user) {
            return res.status(404).json({
                status: 'error',
                data: null,
                message: 'Invalid token entered or user has been deleted.'
            });
        }

        //Get address from database
        const address = await prisma.addresses.findUnique({
            where: {
                id: Number(id)
            }
        });

        //If address does not exist, return error
        if (!address) {
            return res.status(404).json({
                status: 'error',
                data: null,
                message: 'Address not found.'
            });
        }

        //If address does not belong to user, return error
        if (address.userId !== uid) {
            return res.status(403).json({
                status: 'error',
                data: null,
                message: 'You are not authorized to view this address.'
            });
        }

        //Send response
        return res.status(200).json({
            status: 'success',
            data: {
                address: address
            },
            message: 'Address retrieved successfully.',
        });
    }

    public static async updateAddress(req: Request, res: Response, next: NextFunction) {
        try {
            //Validate body
            //If contact number is provided, validate it
            if (req.body.contactNumber) {
                try {
                    await ValidationController.validateContactNumber(req.body.contactNumber);
                } catch (e) {
                    console.log(e);
                    return res.status(400).json({
                        status: 'error',
                        data: null,
                        message: 'Invalid contact number entered.'
                    });
                }
            }

            //If pin code is provided, validate it
            if (req.body.pinCode) {
                try {
                    await ValidationController.validatePincode(req.body.pinCode);
                } catch (e) {
                    return res.status(400).json({
                        status: 'error',
                        data: null,
                        message: 'Invalid pin code entered.'
                    });
                }
            }

            //If isDefault is provided, check if it is boolean
            if (req.body.isDefault) {
                if (typeof req.body.isDefault !== 'boolean') {
                    return res.status(400).json({
                        status: 'error',
                        data: null,
                        message: 'Invalid isDefault value entered.'
                    });
                }
            }

            //If type is provided check, if it is one of the allowed values
            if (req.body.type) {
                if (!['Home', 'Work', 'Hotel', 'Other'].includes(req.body.type)) {
                    return res.status(400).json({
                        status: 'error',
                        data: null,
                        message: 'Invalid type.'
                    });
                }
            }


            //Check required parameters - id
            const {id} = req.params;
            if (!id) {
                return res.status(400).json({
                    status: 'error',
                    data: null,
                    message: 'Address id is required parameter.'
                });
            }


            //Check if uid is provided
            const uid: number = Number(req.headers.uid);
            //Get user from database
            const user = await prisma.users.findUnique({
                where: {
                    id: uid,
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

            //Get address from database
            const address = await prisma.addresses.findUnique({
                where: {
                    id: Number(id),
                },
            });

            //If address does not exist, return error
            if (!address) {
                return res.status(404).json({
                    status: 'error',
                    data: null,
                    message: 'Address not found.'
                });
            }

            //If address does not belong to user, return error
            if (address.userId !== uid) {
                return res.status(403).json({
                    status: 'error',
                    data: null,
                    message: 'You are not authorized to update this address.'
                });
            }

            //If isDefault is provided, update all other addresses to false
            if (req.body.isDefault === true) {
                await prisma.addresses.updateMany({
                    where: {
                        userId: uid,
                        id: {
                            not: Number(id)
                        }
                    },
                    data: {
                        isDefault: false,
                    },
                });
            }

            //Update address
            const updatedAddress = await prisma.addresses.update({
                where: {
                    id: Number(id),
                },
                data: req.body,
            });

            //Send response
            return res.status(200).json({
                status: 'success',
                data: {
                    address: updatedAddress
                },
                message: 'Address updated successfully.',
            });
        } catch (e) {
            return res.status(500).json({
                status: 'error',
                data: e,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }
}