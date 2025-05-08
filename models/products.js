import { Schema, model } from "mongoose";
import normalize from "normalize-mongoose";

const productSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
    images: [{
      public_id: { type: String, required: true },
      url: { type: String, required: true }
    }]
  },
  {
    timestamps: true,
  }
);

productSchema.plugin(normalize);

export const ProductModel = model("Product", productSchema);