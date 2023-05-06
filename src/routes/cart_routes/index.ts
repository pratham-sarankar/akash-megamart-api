import express from "express";
import me_routes from "./me_routes";

const router = express.Router();

router.use("/me", me_routes);

export default router;