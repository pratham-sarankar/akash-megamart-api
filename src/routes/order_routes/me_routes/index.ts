import express from "express";
import TokenMiddleware from "../../../middlewares/token_middleware";
import OrderController from "../../../controllers/order_controllers/order_controller";

const router = express.Router();

router.get("/", TokenMiddleware.authorize, OrderController.fetch);

export default router;