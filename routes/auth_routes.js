import { Router } from "express";
import { registerUser } from "../controllers/user.js";
import { login } from "../controllers/auth.js";




const router = Router();  

// Define routes for user registration and login
router.post("/users/register", registerUser);
router.post("/login", login); 

export default router;  
