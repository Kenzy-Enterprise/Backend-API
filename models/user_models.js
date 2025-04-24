
import { Schema, model } from "mongoose";
import normalize from "normalize-mongoose";


const userSchema = new Schema(
  {
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
      // validate: {
      //   validator: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
      //   message: "Invalid email format",
      // },
    
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    phone: {
      type: Number,
      required: [true, "Phone number is required"],
      validate: {
        validator: (phone) => /^[0-9]{10,15}$/.test(phone),
        message: "Phone number must be 10-15 digits",
      },

      role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
      },
    },
});


userSchema.plugin(normalize);

export const UserModel = model("User", userSchema);
