import * as Paytm from "paytm-pg-node-sdk";

// Set Paytm staging environment
let environment = Paytm.LibraryConstants.STAGING_ENVIRONMENT;

const mid = 'KNnkys04839740536057';
const merchantKey = 'ZAC#hjRrBw%ZQYpu';
const website = 'WEBSTAGING';

const callbackUrl = `${process.env.HOST}/payments/paytm/callback`;
Paytm.MerchantProperties.setCallbackUrl(callbackUrl);

Paytm.MerchantProperties.initialize(environment, mid, merchantKey, website);

console.log(Paytm.MerchantProperties.getMid());
export default Paytm;