import Joi from "joi";

// User Registration Validator
export const registerValidator = Joi.object({
    name: Joi. string().min(3).max(40).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(20).required(),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/).required()

});

// User login validator
export const loginValidator = Joi.object({
    email: Joi.string().email.required(),
    password: Joi.string().required()
});

// Otp validator
export const otpValidator = Joi.object({
    email: Joi.string().email.required(),
    otp: Joi.string().length(6).required()
});

// password reset validator
export const passwordResetValidator = Joi.object({
    email: Joi.string().email.required(),
    newPassword: Joi.string().min(6).max(30).required(),
    otp: Joi.string().length(6).required()
});

