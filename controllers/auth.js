import bcrypt from "bcrypt";
import { sendOTP } from "../email/email_service.js";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user_models.js";
import {
  registerValidator,
  loginValidator,
  otpValidator,
  passwordResetValidator,
} from "../validators/user_validator.js";

// Helper function to generate OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Register a new user
export const registerUser = async (req, res) => {
  try {
    const { error, value } = registerValidator.validate(req.body);
    if (error) {
      return res.status(422).json({ error: error.details });
    }

    // Check if user exists
    const existingUser = await UserModel.findOne({
      $or: [{ username: value.username }, { email: value.email }],
    });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(value.password, 10);

    // Create user
    const user = await UserModel.create({
      ...value,
      password: hashedPassword,
    });

    // Generate and send OTP
    const otp = generateOTP();
    await sendOTP(value.email, otp);

    res.status(201).json({
      message: "OTP sent to your email",
      userId: user._id,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// User login
export const login = async (req, res) => {
  try {
    const { error, value } = loginValidator.validate(req.body);
    if (error) {
      return res.status(422).json({ error: error.details });
    }

    // Check if user exists
    const user = await UserModel.findOne({ email: value.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify password
    const isPasswordValid = bcrypt.compareSync(value.password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { error, value } = otpValidator.validate(req.body);
    if (error) {
      return res.status(422).json({ error: error.details });
    }

    // Check if user exists
    const user = await UserModel.findById(value.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify OTP (this is a placeholder; implement your own OTP verification logic)
    if (value.otp !== user.otp) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    // OTP verified successfully
    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Password reset request
export const requestPasswordReset = async (req, res) => {
  try {
    const { error, value } = passwordResetValidator.validate(req.body);
    if (error) {
      return res.status(422).json({ error: error.details });
    }

    // Check if user exists
    const user = await UserModel.findOne({ email: value.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate and send OTP for password reset
    const otp = generateOTP();
    await sendOTP(value.email, otp);

    res.status(200).json({
      message: "OTP sent to your email for password reset",
      userId: user._id,
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Password reset
export const resetPassword = async (req, res) => {
  try {
    const { error, value } = passwordResetValidator.validate(req.body);
    if (error) {
      return res.status(422).json({ error: error.details });
    }

    // Check if user exists
    const user = await UserModel.findById(value.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify OTP (this is a placeholder; implement your own OTP verification logic)
    if (value.otp !== user.otp) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    // Hash new password and update user
    const hashedPassword = bcrypt.hashSync(value.newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
