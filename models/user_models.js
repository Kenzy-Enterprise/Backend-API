// import { Schema, model } from "mongoose";
// import normalize from "normalize-mongoose";

// const userSchema = new Schema({
//   name: {
//     type: String,
//     required: [true, "Name is required"],
//     trim: true,
//     minlength: [3, "Name must be at least 3 characters"],
//     maxlength: [50, "Name cannot exceed 50 characters"],
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     lowercase: true,
//     trim: true,
//   },
//   password: {
//     type: String,
//     required: [true, "Password is required"],
//     minlength: [6, "Password must be at least 6 characters"],
//   },
//   phone: {
//     type: Number,
//     required: [true, "Phone number is required"],
//     validate: {
//       validator: (phone) => /^[0-9]{10,15}$/.test(phone),
//       message: "Phone number must be 10-15 digits",
//     },
//   },

//   role: {
//     type: String,
//     default: "user",
//     enum: ["user", "admin"],
//   },
// });

// userSchema.plugin(normalize);
// export const UserModel = model("User", userSchema);

import { Schema, model } from "mongoose";
import normalize from "normalize-mongoose";

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [3, "Name must be at least 3 characters"],
    maxlength: [50, "Name cannot exceed 50 characters"],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"],
  },
  passwordChangedAt: Date, // Add this field
  phone: {
    type: String, // Changed to String type
    required: [true, "Phone number is required"],
    validate: {
      validator: (phone) => /^[0-9]{10,15}$/.test(phone),
      message: "Phone number must be 10-15 digits",
    },
  },

  role: {
    type: String,
    default: "user",
    enum: ["user", "admin"],
  },
});

// Add password changed check method
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.plugin(normalize);
export const UserModel = model("User", userSchema);
