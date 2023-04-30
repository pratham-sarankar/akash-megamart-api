import express from "express";
import ProductController from "../../controllers/product_controller/product_controller";
import ProductSearchController from "../../controllers/product_controller/product_search_controller";

const router = express.Router();

router.get("/search", ProductSearchController.search);
router.post("/sync", ProductController.sync);

export default router;