import {orders, users} from "@prisma/client";
import Paytm from "../../../config/payment_configs/paytm";

export default class PaytmGateway {
    public static async createTxnToken(user: users, order: orders) {
        const channelId = Paytm.EChannelId.WAP;
        const orderId = `ORDER_ID_${order.id}`;
        const txnAmount = Paytm.Money.constructWithCurrencyAndValue(Paytm.EnumCurrency.INR, `${order.amount}`);
        const userInfo = new Paytm.UserInfo(`${user.id}`);
        // userInfo.setAddress("CUSTOMER_ADDRESS");
        userInfo.setEmail(user.email ?? '');
        // userInfo.setFirstName("CUSTOMER_FIRST_NAME");
        // userInfo.setLastName("CUSTOMER_LAST_NAME");
        userInfo.setMobile(user.contactNumber ?? '');
        // userInfo.setPincode("CUSTOMER_PINCODE");
        const paymentDetailBuilder = new Paytm.PaymentDetailBuilder(channelId, orderId, txnAmount, userInfo);
        const paymentDetail = paymentDetailBuilder.build();
        const response = await Paytm.Payment.createTxnToken(paymentDetail);
        return response;
    }
}
