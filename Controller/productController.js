import Product from "../model/product.js";
import Vendor from "../model/user.js";
import Media from "../model/media.js";

export const createProduct = async (req, res) => {
  try {
    const {
      product_name,
      description,
      price,
      gst_percentage,
      minimum_order_quantity,
      available_stock,
      vendor_id,
    } = req.body;

    if (
      !product_name ||
      !description ||
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

    const newProduct = await Product.create({
      product_name,
      description,
      price,
      gst_percentage,
      minimum_order_quantity,
      available_stock,
      vendor_id: vendor_id,
      created_by: req.user.id,
      update_by: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      data: newProduct,
    });
  } catch (error) {
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

    const { count, rows: products } = await Product.findAndCountAll({
      where: { is_active: true },
      limit: limit,
      offset: offset,
      order: [["createdAt", "DESC"]],
    });

    const productsWithVendorAndImages = await Promise.all(
      products.map(async (product) => {
        // Get vendor information
        const vendor = await Vendor.findOne({
          where: { id: product.vendor_id },
          attributes: ["name"],
        });

        // Get images from media table for this product
        const images = await Media.findAll({
          where: {
            product_id: product.id,
            is_active: true,
          },
          attributes: ["product_id", "name"],
        });

        const productJSON = product.toJSON();
        productJSON.vendor_name = vendor ? vendor.name : null;

        // Add images to the product
        productJSON.images = images.map((image) => image.toJSON());

        // Add a primary image property for convenience
        const primaryImage = images.find((img) => img.is_primary) || images[0];
        productJSON.primary_image = primaryImage
          ? primaryImage.file_path
          : null;

        return productJSON;
      })
    );

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      success: true,
      data: {
        products: productsWithVendorAndImages,
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
