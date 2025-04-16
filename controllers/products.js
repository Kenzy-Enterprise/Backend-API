import { ProductModel } from "../models/products.js";
import { addProductValidator } from "../validators/product_validators.js";

export const addProducts = async (req, res, next) => {
  try {
    console.log(req.file, req.files);
    // upload product image

    // validate product data
    const { error, value } = addProductValidator.validate(req.body);

    if (error) {
      return res.status(400).json(error);
    }
    const product = new ProductModel(req.body);

    const newProduct = await product.save();
    res.status(200).json({
      product: newProduct,
    });

    // save product to database
    const result = await ProductModel.create(value);
    // return response
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};
// get all products
export const getProducts = async (req, res, next) => {
  try {
    const { filter = "{}", sort = "{}" } = req.query;
    // fetch products from database
    const result = await ProductModel.find(JSON.parse(filter)).sort(
      JSON.parse(sort)
    );
    // return response
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    // fetch product from database
    const result = await ProductModel.findById(id);
    // return response
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// update product
export const updateProduct = async (req, res) => {
  res.send("product with id ${req.params.id} updated");
};

// delete product
export const deleteProduct = async (req, res) => {
  res.send("product with id ${req.params.id} deleted");
};
