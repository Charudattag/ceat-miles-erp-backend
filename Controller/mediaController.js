import Media from "../model/media.js";
import Product from "../model/product.js";

export const addMedia = async (req, res) => {
  try {
    const { product_id } = req.body;
    const files = req.files;

    if (!files || (!files.images && !files.videos && !files.pdf)) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one file",
      });
    }

    const mediaFiles = [];

    // Process images
    if (files.images) {
      for (const image of files.images) {
        mediaFiles.push({
          name: image.filename,
          type: "IMAGE",
          product_id,
          created_by: req.user.id,
          update_by: req.user.id,
        });
      }
    }

    // Process videos
    if (files.videos) {
      for (const video of files.videos) {
        mediaFiles.push({
          name: video.filename,
          type: "VIDEO",
          product_id,
          created_by: req.user.id,
          update_by: req.user.id,
        });
      }
    }

    // Process PDFs
    if (files.pdf) {
      for (const pdfFile of files.pdf) {
        mediaFiles.push({
          name: pdfFile.filename,
          type: "PDF",
          product_id,
          created_by: req.user.id,
          update_by: req.user.id,
        });
      }
    }

    const savedMedia = await Media.bulkCreate(mediaFiles);

    return res.status(201).json({
      success: true,
      message: "Media files uploaded successfully",
      data: savedMedia,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to upload media",
      error: error.message,
    });
  }
};

export const getAllMedia = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: media } = await Media.findAndCountAll({
      where: { is_active: true },
      limit: limit,
      offset: offset,
      order: [["createdAt", "DESC"]],
      attributes: ["id", "name", "type", "product_id", "is_active"],
    });

    const mediaWithProducts = await Promise.all(
      media.map(async (item) => {
        const product = await Product.findByPk(item.product_id, {
          attributes: ["product_name"],
        });
        return {
          ...item.toJSON(),
          product_name: product ? product.product_name : null,
        };
      })
    );

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      success: true,
      data: {
        media: mediaWithProducts,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: count,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching media",
      error: error.message,
    });
  }
};

export const updateMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, product_id, is_active } = req.body;

    const media = await Media.findOne({
      where: {
        id: id,
        is_active: true,
      },
    });

    if (!media) {
      return res.status(404).json({
        success: false,
        message: "Media not found",
      });
    }

    const updatedMedia = await media.update({
      name: name || media.name,
      type: type || media.type,
      product_id: product_id || media.product_id,
      is_active: is_active !== undefined ? is_active : media.is_active,
      update_by: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Media updated successfully",
      data: updatedMedia,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update media",
      error: error.message,
    });
  }
};

export const deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;

    const media = await Media.findOne({
      where: {
        id: id,
        is_active: true,
      },
    });

    if (!media) {
      return res.status(404).json({
        success: false,
        message: "Media not found",
      });
    }

    await media.update({
      is_active: false,
      update_by: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Media deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete media",
      error: error.message,
    });
  }
};

export const getMediaById = async (req, res) => {
  try {
    const { id } = req.params;

    const media = await Media.findOne({
      where: {
        id: id,
        is_active: true,
      },
      attributes: ["id", "name", "type", "product_id", "is_active"],
    });

    if (!media) {
      return res.status(404).json({
        success: false,
        message: "Media not found",
      });
    }

    const product = await Product.findByPk(media.product_id, {
      attributes: ["product_name"],
    });

    const mediaWithProduct = {
      ...media.toJSON(),
      product_name: product ? product.product_name : null,
    };

    return res.status(200).json({
      success: true,
      data: mediaWithProduct,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching media",
      error: error.message,
    });
  }
};
