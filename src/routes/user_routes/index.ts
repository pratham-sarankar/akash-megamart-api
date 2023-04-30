import express from "express";
import auth_routes from "./auth_routes";
import profile_routes from "./profile_routes";
import address_routes from "./address_routes/address_routes";

const router = express.Router();

router.use(auth_routes);
router.use(profile_routes);
router.use(address_routes);

export default router;
