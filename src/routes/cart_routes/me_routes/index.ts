import express from "express";
import TokenMiddleware from "../../../middlewares/token_middleware";
import CartController from "../../../controllers/cart_controllers/cart_controller";
import CartSummaryController from "../../../controllers/cart_controllers/cart_summary_controller";

const router = express.Router();

router.get("/", TokenMiddleware.authorize, CartController.fetch);
router.get("/summary", TokenMiddleware.authorize, CartSummaryController.fetch);
router.post('/', TokenMiddleware.authorize, CartController.add);
router.put('/:id', TokenMiddleware.authorize, CartController.update);
router.delete('/:id', TokenMiddleware.authorize, CartController.remove);

export default router;