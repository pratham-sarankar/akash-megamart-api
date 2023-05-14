import express from "express";
import ProductController from "../../controllers/product_controllers/product_controller";
import ProductSearchController from "../../controllers/product_controllers/product_search_controller";

const router = express.Router();

router.get("/search", ProductSearchController.search);
router.get("/top", ProductSearchController.topProducts);
router.post("/sync", ProductController.sync);

export default router;