import { ProductModel } from "../models/products.js";
import { addProductValidator } from "../validators/product_validators.js";
// import { upload } from "../middlewares/upload.js";
// import cloudinary from "../config/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";


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
  const updateProduct = await ProductModel.findByIdAndUpdate(
    req.params.id,
    req.body,

    { new: true, runValidators: true }
  );
  res.json(`product with id ${req.params.id} updated`);
};

// delete product
export const deleteProduct = async (req, res) => {
  const deleteProduct = await ProductModel.findByIdAndDelete(req.params.id,
    req.body,

    { new: true, runValidators: true}
  );

  res.send(`product with id ${req.params.id} deleted`);
};
// import { ProductModel } from "../models/products.js";
// import { addProductValidator } from "../validators/product_validators.js";
// import cloudinary from "../config/cloudinary.js";

// export const addProducts = async (req, res, next) => {
//   try {
//     // Validate request data
//     const { error, value } = addProductValidator.validate(req.body);
//     if (error) return res.status(400).json({ error: error.details });

//     // Check for uploaded files
//     if (!req.files?.length) {
//       return res.status(400).json({ error: "No images uploaded" });
//     }

//     // Upload images to Cloudinary
//     const imageUploads = req.files.map(async (file) => {
//       try {
//         const result = await cloudinary.uploader.upload(file.path, {
//           folder: "products",
//           quality: "auto",
//           fetch_format: "auto"
//         });
//         return {
//           public_id: result.public_id,
//           url: result.secure_url
//         };
//       } catch (uploadError) {
//         throw new Error(`Failed to upload image: ${uploadError.message}`);
//       }
//     });

//     // Wait for all image uploads
//     const images = await Promise.all(imageUploads);

//     // Create product with image data
//     const productData = {
//       ...value,
//       images
//     };

//     const newProduct = await ProductModel.create(productData);

//     res.status(201).json({
//       status: "success",
//       data: {
//         product: newProduct
//       }
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// export const getProducts = async (req, res, next) => {
//   try {
//     const { filter = "{}", sort = "{}" } = req.query;
//     const products = await ProductModel.find(JSON.parse(filter))
//       .sort(JSON.parse(sort))
//       .select("-__v");

//     res.status(200).json({
//       status: "success",
//       results: products.length,
//       data: { products }
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// export const getProductById = async (req, res, next) => {
//   try {
//     const product = await ProductModel.findById(req.params.id)
//       .select("-__v");

//     if (!product) {
//       return res.status(404).json({
//         status: "fail",
//         message: "Product not found"
//       });
//     }

//     res.status(200).json({
//       status: "success",
//       data: { product }
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// export const updateProduct = async (req, res, next) => {
//   try {
//     const updatedProduct = await ProductModel.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true, runValidators: true }
//     ).select("-__v");

//     if (!updatedProduct) {
//       return res.status(404).json({
//         status: "fail",
//         message: "Product not found"
//       });
//     }

//     res.status(200).json({
//       status: "success",
//       data: { product: updatedProduct }
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// export const deleteProduct = async (req, res, next) => {
//   try {
//     const product = await ProductModel.findById(req.params.id);

//     if (!product) {
//       return res.status(404).json({
//         status: "fail",
//         message: "Product not found"
//       });
//     }

//     // Delete images from Cloudinary
//     const deletePromises = product.images.map(async (image) => {
//       await cloudinary.uploader.destroy(image.public_id);
//     });

//     await Promise.all(deletePromises);
//     await ProductModel.findByIdAndDelete(req.params.id);

//     res.status(204).json({
//       status: "success",
//       data: null
//     });
//   } catch (error) {
//     next(error);
//   }
// };