
import Joi from "joi";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendOTPEmail } from "../utils/mail.js";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user_models.js";
import {
  loginValidator,
  updatePasswordValidator,
  otpValidator,
  resetPasswordValidator,
  forgotPasswordValidator 
} from "../validators/user_validator.js";


// User Registration Controller
// export const registerUser = async (req, res, next) => {
//   try {
//     const { error, value } = registerValidator.validate(req.body);
//     if (error) return res.status(422).json({ error: error.details });

//     const existingUser = await UserModel.findOne({
//       $or: [{ name: value.name }, { email: value.email }],
//     });

//     if (existingUser) {
//       return res.status(409).json({ message: "User already exists!" });
//     }

//     const hashedPassword = await bcrypt.hash(value.password, 10);
//     await UserModel.create({ ...value, password: hashedPassword });

//     res.status(201).json({ message: "User successfully registered!" });
//   } catch (error) {
//     next(error);
//   }
// };


// User Login Controller
export const loginUser = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = loginValidator.validate(req.body);
    if (error) {
      return res.status(422).json({
        status: 'fail',
        error: error.details.map(d => d.message)
      });
    }

    // Find user with password explicitly selected
    const user = await UserModel.findOne({ email: value.email })
      .select('+password');

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: "User not found"
      });
    }

    // Check if password exists (in case of social login users)
    if (!user.password) {
      return res.status(400).json({
        status: 'fail',
        message: "Password authentication not enabled for this user"
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(value.password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'fail',
        message: "Invalid credentials"
      });
    }

    // Verify JWT secret exists
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET missing in environment variables');
      return res.status(500).json({
        status: 'error',
        message: "Server configuration error"
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Return response without sensitive data
    res.status(200).json({
      status: 'success',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      status: 'error',
      message: "Internal server error",
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
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
export const resetPassword = async (req, res) => {
  try {
    const { error, value } = resetPasswordValidator.validate(req.body);
    if (error) return res.status(422).json({ error: error.details });

    const user = await UserModel.findOne({ email: value.email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate reset token and expiration
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save hashed token and expiration
    user.resetToken = await bcrypt.hash(resetToken, 10);
    user.resetExpires = resetExpire;
    await user.save();

    // Send reset link via email
    await sendOTPEmail(user.email, resetToken);

    res.status(200).json({
      status: 'success',
      message: 'Password reset link sent to registered email'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Send OTP for Password Reset
export const sendPasswordResetOTP = async (req, res) => {
  try {
    const { error, value } = forgotPasswordValidator.validate(req.body);
    if (error) return res.status(422).json({ error: error.details });

    const user = await UserModel.findOne({ email: value.email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save hashed OTP and expiration
    user.otp = await bcrypt.hash(otp, 10);
    user.otpExpire = otpExpire;
    user.otpAttempts = 0;
    await user.save();

    // Send OTP via email
    await sendOTPEmail(user.email, otp);

    res.status(200).json({
      status: 'success',
      message: 'OTP sent to registered email'
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Verify OTP and Reset Password
export const resetPasswordWithOTP = async (req, res) => {
  try {
    const { error, value } = resetPasswordValidator.validate(req.body);
    if (error) return res.status(422).json({ error: error.details });

    const user = await UserModel.findOne({ email: value.email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check OTP attempts
    if (user.otpAttempts >= 3) {
      return res.status(429).json({ 
        message: 'Too many attempts. Please request new OTP' 
      });
    }

    // Check OTP expiration
    if (Date.now() > user.otpExpire) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    // Verify OTP
    const isValidOTP = await bcrypt.compare(value.otp, user.otp);
    if (!isValidOTP) {
      user.otpAttempts += 1;
      await user.save();
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Reset password and clear OTP fields
    user.password = await bcrypt.hash(value.newPassword, 12);
    user.otp = undefined;
    user.otpExpire = undefined;
    user.otpAttempts = 0;
    user.passwordChangedAt = Date.now() - 1000;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};