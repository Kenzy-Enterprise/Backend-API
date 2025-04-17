import { Router } from "express";
import { addProducts, deleteProduct, getProductById, getProducts, updateProduct } from "../controllers/products.js";



const productsRouter = Router();

// Routes
productsRouter.post("/products", addProducts); // GET all products
productsRouter.get("/products", getProducts); // GET a single product
productsRouter.get("/product/:id", getProductById); // ADD a new product
productsRouter.patch("/product/:id", updateProduct); // UPDATE a product
productsRouter.delete("/product/:id", deleteProduct); // DELETE a product

export default productsRouter;
