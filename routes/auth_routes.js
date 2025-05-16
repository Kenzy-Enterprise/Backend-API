import { Router } from "express";
import {
  loginUser,
  resetPasswordWithOTP,
  sendPasswordResetOTP,
  updatePassword,
  verifyOTP
} from "../controllers/user.js";
import { protect } from "../middlewares/auth.js";

const userRouter = Router();

// Authentication routes
//
userRouter.post("/login", loginUser);
userRouter.post("/verify-otp", verifyOTP);

// Password management routes
userRouter.patch("/update-password", protect, updatePassword);
userRouter.post("/forgot-password", sendPasswordResetOTP);
userRouter.post("/reset-password", resetPasswordWithOTP);

export default userRouter;