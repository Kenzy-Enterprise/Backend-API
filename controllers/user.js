
import Joi from "joi";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user_models.js";
import {
  loginValidator,
  registerValidator,
  updatePasswordValidator,
  otpValidator,
  passwordResetValidator,
} from "../validators/user_validator.js";

// User Registration Controller
export const registerUser = async (req, res, next) => {
  try {
    const { error, value } = registerValidator.validate(req.body);
    if (error) return res.status(422).json({ error: error.details });

    const existingUser = await UserModel.findOne({
      $or: [{ name: value.name }, { email: value.email }],
    });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists!" });
    }

    const hashedPassword = await bcrypt.hash(value.password, 10);
    await UserModel.create({ ...value, password: hashedPassword });

    res.status(201).json({ message: "User successfully registered!" });
  } catch (error) {
    next(error);
  }
};

// User Login Controller
export const loginUser = async (req, res) => {
  try {
    const { error, value } = loginValidator.validate(req.body);
    if (error) return res.status(422).json({ error: error.details });

    const user = await UserModel.findOne({ email: value.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isPasswordValid = await bcrypt.compare(value.password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      token,
      user: { id: user._id, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// OTP Verification Controller
export const verifyOTP = async (req, res) => {
  try {
    const { error, value } = otpValidator.validate(req.body);
    if (error) return res.status(422).json({ error: error.details });

    const user = await UserModel.findById(value.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Implement actual OTP verification logic here
    if (value.otp !== user.otp) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// // Password Update Controller
export const updatePassword = async (req, res) => {
  try {
    const { error, value } = updatePasswordValidator.validate(req.body);
    if (error) return res.status(422).json({ 
      status: 'fail',
      error: error.details 
    });

    // Get fresh user with password
    const user = await UserModel.findById(req.user._id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    // Verify old password exists
    if (!user.password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Password not set for this user'
      });
    }

    const isPasswordValid = await bcrypt.compare(
      value.oldPassword,
      user.password // Now guaranteed to exist
    );
    
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid current password'
      });
    }

    user.password = await bcrypt.hash(value.newPassword, 10);
    user.passwordChangedAt = Date.now() - 1000;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully!'
    });
  } catch (error) {
    console.error("Password update error:", error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Password Reset Controller
