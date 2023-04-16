import express from "express";
import UserSignUpController from "../../../controllers/user_controllers/auth_controllers/signup_controller";

const router = express.Router();

const signupRouter = express.Router();

signupRouter.post("/email", UserSignUpController.signUpWithEmailAndPassword);
signupRouter.post("/contact-number", UserSignUpController.signUpWithContactNumber);

router.use("/signup", signupRouter);

export default router;