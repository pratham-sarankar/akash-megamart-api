import {NextFunction, Request, Response} from "express";
import {JwtPayload} from "jsonwebtoken";
import TokenController from "../controllers/security_controllers/token_controller";

export default class TokenMiddleware {
    public static async authorize(req: Request, res: Response, next: NextFunction) {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                status: 'error',
                data: {
                    code: "no_token",
                },
                message: "Unauthorized Access - No token provided"
            });
        }

        try {
            TokenController.verifyToken(token);
            const decodedToken: JwtPayload = TokenController.decodeToken(token)?.payload as JwtPayload;
            req.headers.uid = decodedToken.uid;
            next();
        } catch (error: any) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json(
                    {
                        status: 'error',
                        data: {
                            code: "expired_token",
                        },
                        message: "Token Expired, please refresh the token to gain access",
                    }
                );
            } else {
                return res.status(401).json(
                    {
                        status: 'error',
                        data: {
                            code: "invalid_token",
                        },
                        message: "Unauthorized Access - Invalid or expired token",
                    }
                );
            }


        }
    }
}