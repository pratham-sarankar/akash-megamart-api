import {NextFunction, Request, Response} from "express";
import TokenController from "../../security_controllers/token_controller";
import {JwtPayload} from "jsonwebtoken";
import prisma from "../../../config/database";

export default class AuthController {
    public static async refreshAccessToken(req: Request, res: Response, next: NextFunction) {
        //Check required fields - refreshToken
        const refreshToken = req.body.refreshToken;
        console.log(refreshToken);
        if (!refreshToken) {
            return res.status(400).json({
                status: 'error',
                data: null,
                message: 'Refresh Token is a required parameter'
            });
        }

        //Verify and decode refresh token
        try {
            await TokenController.verifyToken(refreshToken);
        } catch (e) {
            return res.status(401).json({
                status: 'error',
                data: null,
                message: 'The refresh token is not valid, please signin again.',
            });
        }

        //Get user id from refresh token
        const decodeToken = TokenController.decodeToken(refreshToken);
        const userId = (decodeToken?.payload as JwtPayload).uid;

        //Check if this refresh token is the same as the one in the database
        const user = await prisma.users.findUnique({
            where: {
                id: userId
            }
        });
        if (!user) {
            return res.status(404).json({
                status: 'error',
                data: null,
                message: 'User does not exist'
            });
        }

        if (user.refreshToken !== refreshToken) {
            return res.status(401).json({
                status: 'error',
                data: null,
                message: 'The refresh token is not valid, please signin again.',
            });
        }

        //Generate new access token
        const newAccessToken = TokenController.generateAccessToken(userId);
        const newRefreshToken = TokenController.generateRefreshToken(userId);

        //Update refresh token in database
        user.refreshToken = newRefreshToken;
        await prisma.users.update({
            where: {
                id: userId // replace userId with the actual ID of the user you want to update
            },
            data: user
        });


        return res.status(200).json({
            status: 'success',
            data: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            },
            message: 'Access token refreshed successfully.'
        });
    }
}