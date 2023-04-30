import express from "express";
import UserAddressController from "../../../controllers/user_controllers/address_controllers/address_controller";
import TokenMiddleware from "../../../middlewares/token_middleware";

const router = express.Router();

const addressRouter = express.Router();

addressRouter.get("/all", TokenMiddleware.authorize, UserAddressController.getAllAddresses);
addressRouter.get("/:id", TokenMiddleware.authorize, UserAddressController.getAddress);
addressRouter.put("/:id", TokenMiddleware.authorize, UserAddressController.updateAddress);
addressRouter.post("/add", TokenMiddleware.authorize, UserAddressController.addAddress);
addressRouter.delete("/:id", TokenMiddleware.authorize, UserAddressController.removeAddress);

router.use("/address", addressRouter);

export default router;