import { v4 as uuidv4 } from "uuid";
import SharedProductCollection from "../model/shared_collection.js";
import Product from "../model/product.js";
import Vendor from "../model/user.js";
import { Op } from "sequelize";
import Media from "../model/media.js";

// Create a shared product collection
export const createSharedProductCollection = async (req, res) => {
  try {
    const { product_ids } = req.body;

    if (
      !product_ids ||
      !Array.isArray(product_ids) ||
      product_ids.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one product to share",
      });
    }

    // Validate that all product IDs exist
    const products = await Product.findAll({
      where: {
        id: product_ids,
        is_active: true,
      },
    });

    if (products.length !== product_ids.length) {
      return res.status(400).json({
        success: false,
        message: "One or more selected products do not exist or are inactive",
      });
    }

    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    const slug = `share-${timestamp}-${randomStr}`;

    const sharedCollection = await SharedProductCollection.create({
      product_ids,
      created_by: req.user.id,
      expires_at: null,
      slug: slug,
    });

    return res.status(201).json({
      success: true,
      message: "Product collection shared successfully",
      data: {
        id: sharedCollection.id,
        slug: slug,
        expires_at: null,
        product_count: product_ids.length,
      },
    });
  } catch (error) {
    console.error("Error creating shared product collection:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create shared product collection",
      error: error.message,
    });
  }
};

export const getSharedProducts = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Collection ID or slug is required",
      });
    }

    let sharedCollection;

    if (!isNaN(id)) {
      sharedCollection = await SharedProductCollection.findByPk(id);
    }

    if (!sharedCollection) {
      sharedCollection = await SharedProductCollection.findOne({
        where: { slug: id },
      });
    }

    if (!sharedCollection) {
      return res.status(404).json({
        success: false,
        message: "Shared collection not found",
      });
    }

    if (
      sharedCollection.expires_at &&
      new Date(sharedCollection.expires_at) < new Date()
    ) {
      return res.status(410).json({
        success: false,
        message: "This shared collection has expired",
        data: {
          expiresAt: sharedCollection.expires_at,
          createdAt: sharedCollection.createdAt,
        },
      });
    }

    const productIds = sharedCollection.product_ids;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No products in this collection",
        data: {
          ...sharedCollection.toJSON(),
          products: [],
        },
      });
    }

    // Fetch products
    const products = await Product.findAll({
      where: {
        id: {
          [Op.in]: productIds,
        },
      },
    });

    // Fetch vendors
    const vendorIds = products
      .map((product) => product.vendor_id)
      .filter((id) => id);
    let vendors = [];

    if (vendorIds.length > 0) {
      vendors = await Vendor.findAll({
        where: {
          id: {
            [Op.in]: vendorIds,
          },
        },
        attributes: ["id", "name"],
      });
    }

    const vendorMap = {};
    vendors.forEach((vendor) => {
      vendorMap[vendor.id] = vendor.name;
    });

    const media = await Media.findAll({
      where: {
        product_id: {
          [Op.in]: productIds,
        },
        is_active: true,
      },
      attributes: ["product_id", "name"],
    });

    // Group media by product_id
    const mediaMap = {};
    media.forEach((m) => {
      if (!mediaMap[m.product_id]) {
        mediaMap[m.product_id] = [];
      }
      mediaMap[m.product_id].push(m.toJSON());
    });

    // Format products to include vendor_name & media
    const formattedProducts = products.map((product) => {
      const productJson = product.toJSON();
      return {
        ...productJson,
        vendor_name: productJson.vendor_id
          ? vendorMap[productJson.vendor_id] || null
          : null,
        media: mediaMap[productJson.id] || [], // Add media here
      };
    });

    // Final response
    return res.status(200).json({
      success: true,
      message: "Shared products retrieved successfully",
      data: {
        id: sharedCollection.id,
        slug: sharedCollection.slug,
        product_ids: sharedCollection.product_ids,
        created_by: sharedCollection.created_by,
        expires_at: sharedCollection.expires_at,
        createdAt: sharedCollection.createdAt,
        updatedAt: sharedCollection.updatedAt,
        products: formattedProducts,
      },
    });
  } catch (error) {
    console.error("Error in getSharedProducts:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve shared products",
      error: error.message,
    });
  }
};
