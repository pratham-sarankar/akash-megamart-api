import bcrypt from 'bcrypt';

export default class HashingController {
    public static async hash(password: string) {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    }

    public static async compareHash(plainText: string, hash: string) {
        return await bcrypt.compare(plainText, hash);
    }
}