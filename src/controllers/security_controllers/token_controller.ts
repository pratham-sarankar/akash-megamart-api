import jwt from 'jsonwebtoken';

export default class TokenController {
    public static generateAccessToken(uid: number) {
        //Generate Access Token
        return jwt.sign({uid: uid}, process.env.JWT_SECRET_KEY!, {expiresIn: '15m'});
    }

    public static generateRefreshToken(uid: number) {
        //Generate Refresh Token
        return jwt.sign({uid: uid}, process.env.JWT_SECRET_KEY!, {expiresIn: '7d'});
    }

    public static createVerificationCode(data: any) {
        return jwt.sign(data, process.env.JWT_SECRET_KEY!, {expiresIn: '5m'});
    }

    public static verifyToken(token: string): any {
        const jwtSecretKey = process.env.JWT_SECRET_KEY!;
        return jwt.verify(token, jwtSecretKey);
    }

    public static decodeToken(token: string) {
        const jwtSecretKey = process.env.JWT_SECRET_KEY;
        return jwt.decode(token, {json: true, complete: true});
    }

}