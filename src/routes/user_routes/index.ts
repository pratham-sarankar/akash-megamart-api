import express from "express";
import signin_routes from "./signin_routes";
import signup_routes from "./signup_routes";
import recovery_routes from "./recovery_routes";
import OtpController from "../../controllers/user_controllers/otp_controller";

// Create new router
const router = express.Router();

const authRouter = express.Router();

// Import all customer routes
authRouter.use('/verify-otp', OtpController.verifyOtp);
authRouter.use(signin_routes);
authRouter.use(signup_routes);
authRouter.use(recovery_routes);

router.use("/auth", authRouter);

export default router;