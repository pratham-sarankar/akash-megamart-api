import Razorpay from "razorpay";

const instance = new Razorpay({
    key_id: process.env.RZR_KEY_ID!,
    key_secret: process.env.RZR_KEY_SECRET!,
});

export default instance;
