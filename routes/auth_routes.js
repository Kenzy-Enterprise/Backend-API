import { Router } from "express";
import { registerUser } from "../controllers/user.js";


const userRouter = Router();

userRouter.post("/users/register", registerUser);
// router.post("/verify-otp", verifyOTP);
// router.post("/login", login);
// router.post("/forgot-password", forgotPassword);
// router.post("/reset-password", resetPassword);

export default userRouter;
