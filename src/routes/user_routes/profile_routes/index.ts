import express from "express";
import me_routes from "./me_routes";

const router = express.Router();

const profileRouter = express.Router();

profileRouter.use(me_routes);

router.use("/profile", profileRouter);

export default router;