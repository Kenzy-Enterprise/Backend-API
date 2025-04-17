import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendOTP from "./email.service.js";

import { UserModel } from "../models/user_models.js";
import {
  registerValidator,
  loginValidator,
  otpValidator,
  passwordResetValidator,
} from "../validators/user_validator.js";

// in-memory storage for demo

// const users = [];
// const otpStore = [];
// // 5 minutes expiry for OTP
// const otpExpiry = 5 * 60 * 1000;

// Register a new user
export const r = async (req, res) => {
  const { error, value } = registerValidator.validate(req.body);
  if (error) {
    return res.status(422).json(error);
  }}

  // check if user does not exist already
  const user = await UserModel.findOne({
    $or: [{ username: value.username }, { email: value.email }],
  });
  // hash plaintext password
  const hashedPassword = bcrypt.hashSync(value.password, 10);
  // create user record in database
  await UserModel.create({
    ...value,
    password: hashedPassword,
  });

 
    await sendOTP(email,otp);

    res.status(201).json({
        message: "otp sent to your email",
    });
