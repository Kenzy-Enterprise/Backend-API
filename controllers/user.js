import { UserModel } from "../models/user_models.js";
import {
  loginValidator,
  registerValidator,
  updateValidator,
} from "../validators/user_validator.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res, next) => {
  const { error, value } = registerValidator.validate(req.body);
  if (error) {
    return res.status(422).json(error);
  }

  const user = await UserModel.findOne({
    $or: [{ name: value.name }, { email: value.email }],
  });

  if (user) {
    return res.status(409).json("User already exists!");
  }

  const hashedPassword = bcrypt.hashSync(value.password, 10);

  const result = await UserModel.create({
    ...value,
    password: hashedPassword,
  });

  res.status(201).json("User Successfully Registered!");
};

export const loginUser = async (req, res) => {
  try {
    const { error, value } = loginValidator.validate(req.body);
    if (error) {
      return res.status(422).json({ error: error.details });
    }

    // Check if user exists
    const user = await UserModel.findOne({
      $or: [
        {
          email: value.email,
        },
      ],
    });
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

// update user role
export const upddateUserRole = async (req, res) => {
  const { error, value } = updateValidator.validate(req.body);
  if (error) {
    return res.status(422).json(error);
  }

  const result = await UserModel.findByIdAndUpdate(
    req.params.id,
    value,

    { new: true }
  );

  res.status(200).json(result);
};


