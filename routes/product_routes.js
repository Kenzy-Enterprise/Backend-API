import { Router } from "express";
import { addProducts, deleteProduct, getProductById, getProducts, updateProduct } from "../controllers/products.js";



const productsRouter = Router();

// Routes
productsRouter.post("/", addProducts); // GET all products
productsRouter.get("/", getProducts); // GET a single product
productsRouter.get("/:id", getProductById); // ADD a new product
productsRouter.patch("/:id", updateProduct); // UPDATE a product
productsRouter.delete("/:id", deleteProduct); // DELETE a product

export default productsRouter;
