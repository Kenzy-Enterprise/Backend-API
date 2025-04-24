import { UserModel } from "../models/user_models.js";
import { registerValidator } from "../validators/user_validator.js";
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
  })

  res.status(201).json("User Successfully Registered!")
};

export const login = async (req, res, next) => {
  const { error, value } = loginValidator.validate(req.body);
  if (error) {
    return res.status(422).json(error);
  }

  const user = await UserModel.findOne({ email: value.email }).select("+password");

  if (!user) {
    return res.status(401).json("Invalid credentials!");
  }

  const isMatch = bcrypt.compareSync(value.password, user.password);

  if (!isMatch) {
    return res.status(401).json("Invalid credentials!");
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.status(200).json({
    message: "Login successful!",
    token,
  });
};