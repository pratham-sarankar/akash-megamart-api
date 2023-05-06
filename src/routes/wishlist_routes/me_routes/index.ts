import express from "express";
import TokenMiddleware from "../../../middlewares/token_middleware";
import WishlistController from "../../../controllers/wishlist_controllers/wishlist_controller";

const router = express.Router();

router.get("/", TokenMiddleware.authorize, WishlistController.fetch);
router.post("/", TokenMiddleware.authorize, WishlistController.add);
router.delete("/:id", TokenMiddleware.authorize, WishlistController.remove);

export default router;