// import { Router } from "express";
// import { loginUser, registerUser, resetPassword, updatePassword, } from "../controllers/user.js";
// import { protect } from "../middlewares/auth.js";





// const userRouter = Router();  

// // Define routes for user registration and login
// userRouter.post("/register", registerUser);
// userRouter.post("/login", loginUser); 
// // router.patch('/:id', upddateUserRole);
// userRouter.patch("/update-password", protect, updatePassword);
// userRouter.post("/reset-password", resetPassword);

// export default userRouter;  
import { Router } from "express";
import {
  loginUser,
  registerUser,
  updatePassword,
  verifyOTP
} from "../controllers/user.js";
import { protect } from "../middlewares/auth.js";

const userRouter = Router();

// Authentication routes
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/verify-otp", verifyOTP);

// Password management routes
userRouter.patch("/update-password", protect, updatePassword);
userRouter.patch("/reset-password", protect, updatePassword);

export default userRouter;