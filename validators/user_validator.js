import Joi from "joi";

// User Registration Validator
export const registerValidator = Joi.object({
  name: Joi.string().min(3).max(40).required(),
  email: Joi.string().email().required(),
  phone: Joi.number().required(),
  password: Joi.string().min(8).max(20).required(),
  confirmPassword: Joi.ref("password"),
  role: Joi.string().valid("user", "admin").default("user"),
  phone: Joi.string().pattern(/^[0-9]{10,15}$/).required(),
}).with("password", "confirmPassword");

// User login validator
export const loginValidator = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// User update validator
export  const updateValidator = Joi.object({
  role: Joi.string().valid("user", "admin").required(),
  
})

// Otp validator
export const otpValidator = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
});

// update password validator
export const updatePasswordValidator = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().required(),
  confirmPassword: Joi.ref("newPassword"),
}).with("newPassword", "confirmPassword");



export const passwordResetValidator = Joi.object({
  token: Joi.string().required(),
  otp: Joi.string().email().required,
  newPassword: Joi.string().min(8).required(),
  confirmPassword: Joi.ref('newPassword')
}).with('newPassword', 'confirmPassword');

