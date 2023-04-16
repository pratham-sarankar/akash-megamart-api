import express from "express";
import UserRecoveryController from "../../../controllers/user_controllers/auth_controllers/recovery_controller";

const router = express.Router();

const recoveryRouter = express.Router();

recoveryRouter.post("/password", UserRecoveryController.recoverPassword);

router.use("/recover", recoveryRouter);

export default router;