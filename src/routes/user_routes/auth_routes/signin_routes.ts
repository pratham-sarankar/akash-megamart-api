import express from "express";
import UserSignInController from "../../../controllers/user_controllers/auth_controllers/signin_controller";

const router = express.Router();

const signinRouter = express.Router();

signinRouter.post("/email", UserSignInController.signInWithEmailAndPassword);
signinRouter.post("/contact-number", UserSignInController.signInWithContactNumber);


router.use("/signin", signinRouter);

export default router;