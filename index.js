import express from "express";
import productsRouter from "./routes/product_routes.js";
import userRouter from "./routes/auth_routes.js";
import mongoose from "mongoose";


// connect to database
await mongoose.connect(process.env.MONGO_URL)
  console.log("Database is connected");

// create express app
const app = express();

// middlewares

app.use(express.json());

// use route
app.use("/users", userRouter);
app.use(productsRouter);

// listen for incoming requests
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
