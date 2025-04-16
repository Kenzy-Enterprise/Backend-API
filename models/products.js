import { Schema, model } from "mongoose";
import normalize from "normalize-mongoose";

const productSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true, unique: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
    // image: {
    //   type: String,
    //   required: [true, "Product image URL is required"],
    // },
  },
  {
    timestamps: true,
  }
);

productSchema.plugin(normalize);

export const ProductModel = model("Product", productSchema);
