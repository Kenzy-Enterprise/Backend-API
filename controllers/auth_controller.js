import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendOTP from "./email.service.js";

import UserModel from "../models/user.js";
import {
  registerValidator,
  loginValidator,
  otpValidator,
  passwordResetValidator,
} from "../validators/user_validator.js";

// in-memory storage for demo

const users = [];
const otpStore = [];
// 5 minutes expiry for OTP
const otpExpiry = 5 * 60 * 1000;

// Register a new user
export const register = async (req, res) => {
  try {
    const { error } = registerValidator.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const { name, email, password, phone } = req.body;

    // Check if user already exists
    if (users.some((user) => user.email === email)) {
      return res.status(400).json({ error: "User already exists" });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // store user 
    users.push({
      name,
      email,
      password: hashedPassword,
      phone,
      verified: false,
    });

    // send otp  to user email
    await sendOTP(email,otp);

    res.status(201).json({
        message: "otp sent to your email",
    });

} catch (error) {
    res.status(500).json({ error: "server error" });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
    const { error } = otpValidator.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
  
    const { email, otp } = req.body;
  
    if (otpStore[email] !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }
  
    // Mark user as verified
    const user = users.find(user => user.email === email);
    if (user) user.verified = true;
  
    delete otpStore[email];
    res.json({ message: "Account verified successfully" });
  };
  
  // Login User
  export const login = async (req, res) => {
    const { error } = loginValidator.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
  
    const { email, password } = req.body;
  
    const user = users.find(user => user.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
  
    if (!user.verified) {
      return res.status(403).json({ error: "Account not verified" });
    }
  
    // Generate JWT token
    const token = jwt.sign({ userId: user.email }, process.env.JWT_SECRET, {
      expiresIn: "1h"
    });
  
    res.json({ token });
  };
  
  // Forgot Password (Send OTP)
  export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = users.find(user => user.email === email);
    if (!user) return res.status(404).json({ error: "User not found" });
  
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = otp;
  
    await sendOTP(email, otp);
    res.json({ message: "OTP sent to email" });
  };
  
  // Reset Password
  export const resetPassword = async (req, res) => {
    const { error } = passwordResetValidator.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
  
    const { email, newPassword, otp } = req.body;
  
    if (otpStore[email] !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }
  
    const user = users.find(user => user.email === email);
    if (!user) return res.status(404).json({ error: "User not found" });
  
    user.password = await bcrypt.hash(newPassword, 10);
    delete otpStore[email];
  
    res.json({ message: "Password updated successfully" });
  };