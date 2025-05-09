import { ProductModel } from "../models/products.js";
import { addProductValidator } from "../validators/product_validators.js";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Get all products
export const getProducts = async (req, res, next) => {
  try {
    const products = await ProductModel.find();
    
    res.status(200).json({
      status: 'success',
      results: products.length,
      data: {
        products
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// Add new product
export const addProducts = async (req, res, next) => {
  try {
    const { error, value } = addProductValidator.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 'fail',
        error: error.details
      });
    }

    if (!req.files?.length) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please upload at least one product image'
      });
    }

    const imageUploadPromises = req.files.map(async (file) => {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'products',
          quality: 'auto',
          fetch_format: 'auto'
        });
        return {
          public_id: result.public_id,
          url: result.secure_url
        };
      } catch (uploadError) {
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }
    });

    const images = await Promise.all(imageUploadPromises);

    const productData = {
      ...value,
      images
    };

    const newProduct = await ProductModel.create(productData);

    res.status(201).json({
      status: 'success',
      data: {
        product: newProduct
      }
    });

  } catch (error) {
    if (req.files?.length) {
      await Promise.all(req.files.map(file => 
        cloudinary.uploader.destroy(file.public_id)
      ));
    }
    
    console.error('Product creation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// Get single product by ID
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findById(id);
    
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        product
      }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const product = await ProductModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        product
      }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await ProductModel.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }

    const deletePromises = product.images.map(async (image) => {
      await cloudinary.uploader.destroy(image.public_id);
    });

    await Promise.all(deletePromises);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};