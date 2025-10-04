import express from "express";
import Product from "../models/Product.js";
import { isAdmin } from "../middleware/adminMiddleware.js";
import { auth } from "../middleware/tokenMiddleware.js";
import upload from "../middleware/multerMiddleware.js";
import cloudinary from "../config/cloudinaryConfig.js";

const router = express.Router();

//* Create a new product
router.post(
  "/",
  auth,
  isAdmin,
  upload.array("images", 4),
  async (req, res, next) => {
    try {
      const {
        name,
        description,
        category,
        subCategory,
        price,
        sizes,
        isBestseller,
      } = req.body;

      // Upload images to Cloudinary
      const imageUploadPromises = req.files.map((file) =>
        cloudinary.uploader.upload(file.path)
      );

      const imageResponses = await Promise.all(imageUploadPromises);
      const imageUrls = imageResponses.map((response) => response.secure_url);

      const product = new Product({
        name,
        description,
        category,
        subCategory,
        price,
        sizes,
        isBestseller: isBestseller === "true",
        images: imageUrls,
      });

      await product.save();

      res
        .status(201)
        .json({ message: "Product created successfully", product });
    } catch (err) {
      next(err);
    }
  }
);

//* Get all products
router.get("/", async (req, res, next) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

//* Get a single product by ID
router.get("/:id", auth, isAdmin, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
});

//* Update a product by ID
router.put("/:id", auth, isAdmin, async (req, res, next) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res
      .status(200)
      .json({ message: "Product updated successfully", updatedProduct });
  } catch (err) {
    next(err);
  }
});

//* Delete a product by ID
router.delete("/:id", auth, isAdmin, async (req, res, next) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    next(err);
  }
});

export default router;
