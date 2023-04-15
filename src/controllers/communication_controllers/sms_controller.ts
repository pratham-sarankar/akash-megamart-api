import {SNS} from 'aws-sdk';

const sns = new SNS({region: process.env.AWS_REGION}); // Change region to match your AWS region

export default class SMSController {
    public static async sendOtp(contactNumber: string, otp: string): Promise<SNS.PublishResponse> {
        const publishParams: SNS.PublishInput = {
            Message: `Your code is ${otp}`,
            PhoneNumber: contactNumber,
        };
        return await sns.publish(publishParams).promise();
    }

}