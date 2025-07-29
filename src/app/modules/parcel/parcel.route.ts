import { Router } from "express";
import { ParcelControllers } from "./parcel.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = Router();

router.post(
  "/create",
  checkAuth(Role.SENDER, Role.ADMIN, Role.SUPER_ADMIN),
  ParcelControllers.createParcel
);

router.get(
  "/",
  checkAuth(...Object.values(Role)),
  ParcelControllers.getAllParcel
);

export const ParcelRoutes = router;
