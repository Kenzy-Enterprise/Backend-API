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
