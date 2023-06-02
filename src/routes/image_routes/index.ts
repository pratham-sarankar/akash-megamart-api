import express from "express";
import ImageController from "../../controllers/images_controllers";

const router = express.Router();

router.get("/stream", ImageController.stream)
router.post("/upload", ImageController.upload);

export default router;