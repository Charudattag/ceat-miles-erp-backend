import Product from "../model/product.js";
import Vendor from "../model/user.js";
import Media from "../model/media.js";
import Category from "../model/category.js";
import User from "../model/user.js";

export const createProduct = async (req, res) => {
  try {
    const {
      product_name,
      description,
      category_id, // Added category_id
      price,
      gst_percentage,
      minimum_order_quantity,
      available_stock,
      vendor_id,
      tags,
    } = req.body;

    // Validate required fields
    if (
      !product_name ||
      !description ||
      !category_id || // Added category_id validation
      !price ||
      !gst_percentage ||
      !minimum_order_quantity ||
      !available_stock ||
      !vendor_id
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate numeric values
    if (
      price <= 0 ||
      gst_percentage < 0 ||
      minimum_order_quantity <= 0 ||
      available_stock < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid numeric values",
      });
    }

    // Check if category exists
    const categoryExists = await Category.findByPk(category_id);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Validate tags if provided
    let processedTags = [];
    if (tags) {
      // If tags is a string (comma-separated), convert to array
      if (typeof tags === "string") {
        processedTags = tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag);
      }
      // If tags is already an array
      else if (Array.isArray(tags)) {
        processedTags = tags
          .map((tag) => (typeof tag === "string" ? tag.trim() : String(tag)))
          .filter((tag) => tag);
      }
    }

    // Create the product
    const newProduct = await Product.create({
      product_name,
      description,
      category_id,
      price,
      gst_percentage,
      minimum_order_quantity,
      available_stock,
      vendor_id,
      tags: processedTags,
      created_by: req.user.id,
      update_by: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      data: newProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add product",
      error: error.message,
    });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";

    // Build where clause for search
    const whereClause = {
      is_active: true,
      ...(search && {
        [Op.or]: [
          { product_name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
        ],
      }),
    };

    // Get products with pagination
    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "category_name"],
        },
        {
          model: User,
          as: "vendor",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Get media for each product
    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        const productJSON = product.toJSON();

        // Get images from media table for this product
        const images = await Media.findAll({
          where: {
            product_id: product.id,
            is_active: true,
          },
          attributes: ["id", "product_id", "name"],
        });

        // Add images to the product
        productJSON.media = images.map((image) => image.toJSON());

        return productJSON;
      })
    );

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      success: true,
      data: {
        products: productsWithImages,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: count,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error) {
    console.error("Error in getAllProducts:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({
      where: {
        id: id,
        is_active: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const productData = product.toJSON();

    // Fetch vendor information
    if (product.vendor_id) {
      try {
        const vendor = await Vendor.findOne({
          where: {
            id: product.vendor_id,
          },
          attributes: ["id", "name"],
        });

        if (vendor) {
          productData.vendor_name = vendor.name;
        } else {
          productData.vendor_name = "Unknown Vendor";
        }
      } catch (vendorError) {
        console.error("Error fetching vendor:", vendorError);
        productData.vendor_name = "Unknown Vendor";
      }
    } else {
      productData.vendor_name = "No Vendor Assigned";
    }

    try {
      const media = await Media.findAll({
        where: {
          product_id: id,
        },

        attributes: ["id", "name"],
      });

      // Add media to product data
      productData.media = media || [];
    } catch (mediaError) {
      console.error("Error fetching media for product:", mediaError);
      productData.media = [];
    }

    return res.status(200).json({
      success: true,
      data: productData,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      product_name,
      description,
      price,
      gst_percentage,
      minimum_order_quantity,
      available_stock,
      vendor_id,
      tags,
    } = req.body;

    const product = await Product.findOne({
      where: {
        id: id,
        is_active: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const updatedProduct = await product.update({
      product_name,
      description,
      price,
      gst_percentage,
      minimum_order_quantity,
      available_stock,
      vendor_id,
      tags,
      update_by: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating product",
      error: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({
      where: {
        id: id,
        is_active: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await product.update({
      is_active: false,
      update_by: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting product",
      error: error.message,
    });
  }
};
