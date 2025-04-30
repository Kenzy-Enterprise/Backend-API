import { Router } from "express";
import { loginUser, registerUser, upddateUserRole } from "../controllers/user.js";





const router = Router();  

// Define routes for user registration and login
router.post("/register", registerUser);
router.post("/login", loginUser); 
router.patch('/id', upddateUserRole);

export default router;  
