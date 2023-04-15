import nodemailer from 'nodemailer';

export default class MailController {
    public static async sendOtp(mail: string, otp: string) {
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: Number(process.env.MAIL_PORT),
            secure: false,
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.MAIL_USERNAME,
            to: mail,
            subject: 'Verify your email',
            text: `Your OTP is ${otp}`,
        };

        return await transporter.sendMail(mailOptions);
    }

}