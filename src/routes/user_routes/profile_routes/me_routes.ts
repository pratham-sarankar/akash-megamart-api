import express from "express";
import UserProfileController from "../../../controllers/user_controllers/profile_controllers/profile_controller";
import TokenMiddleware from "../../../middlewares/token_middleware";
import AwsS3Middleware from "../../../middlewares/aws_s3_middleware";
import MulterMiddleware from "../../../middlewares/multer_middleware";
import UserPhotoController from "../../../controllers/user_controllers/profile_controllers/photo_controller";

const router = express.Router();

const meRouter = express.Router();

meRouter.get('/', TokenMiddleware.authorize, UserProfileController.getProfile);
meRouter.put('/', TokenMiddleware.authorize, UserProfileController.updateProfile);
meRouter.put('/password', TokenMiddleware.authorize, UserProfileController.updatePassword);
meRouter.put('/photo', TokenMiddleware.authorize, MulterMiddleware.uploader, AwsS3Middleware.uploader, UserPhotoController.uploadPhoto);

router.use("/me", meRouter);

export default router;