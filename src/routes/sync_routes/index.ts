import express from "express";
import SyncController from "../../controllers/sync_controllers/sync_controller";

const router = express.Router();

router.post("/", SyncController.syncAll);

export default router;