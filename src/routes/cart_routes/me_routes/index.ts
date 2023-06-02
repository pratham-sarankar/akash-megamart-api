import express from "express";
import TokenMiddleware from "../../../middlewares/token_middleware";
import CartController from "../../../controllers/cart_controllers/cart_controller";
import CartSummaryController from "../../../controllers/cart_controllers/cart_summary_controller";
import CartCheckoutController from "../../../controllers/cart_controllers/cart_checkout_controller";
import RazorPayController from "../../../controllers/payment_controllers/razorpay_controllers/razorpay_controller";

const router = express.Router();

router.get("/", TokenMiddleware.authorize, CartController.fetch);
router.get("/summary", TokenMiddleware.authorize, CartSummaryController.fetch);
router.post("/checkout", TokenMiddleware.authorize, CartCheckoutController.checkout, RazorPayController.createOrderAndSendResponse);
router.post("/razorpay/verify", TokenMiddleware.authorize, RazorPayController.verifyPayment);
router.post('/', TokenMiddleware.authorize, CartController.add);
router.put('/:id', TokenMiddleware.authorize, CartController.update);
router.delete('/:id', TokenMiddleware.authorize, CartController.remove);

export default router;