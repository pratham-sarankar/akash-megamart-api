import {NextFunction, Request, Response} from "express";
import {JwtPayload} from "jsonwebtoken";
import TokenController from "../controllers/security_controllers/token_controller";

export default class TokenMiddleware {
    public static async authorize(req: Request, res: Response, next: NextFunction) {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                status: 'error',
                data: null,
                message: "Unauthorized Access - No token provided"
            });
        }

        try {
            TokenController.verifyToken(token);
            const decodedToken: JwtPayload = TokenController.decodeToken(token)?.payload as JwtPayload;
            req.headers.uid = decodedToken.uid;
            next();
        } catch (error) {
            return res.status(401).json(
                {
                    status: 'error',
                    data: null,
                    message: "Unauthorized Access - Invalid or expired token",
                }
            );
        }
    }
}