import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwtUtils.js";
import User from "../model/user.js";
import { Op } from "sequelize";
import bcrypt from "bcrypt";

export const addUser = async (req, res) => {
  try {
    const { name, mobile, email, password, role } = req.body;

    if (!name || !mobile || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, mobile, email and password are required",
      });
    }

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { mobile }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email or mobile",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await User.create({
      name,
      mobile,
      email,
      password: hashedPassword,
      role: role || "USER",
    });

    const userResponse = newUser.toJSON();
    delete userResponse.password;

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: userResponse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { mobile, password } = req.body;
    const user = await User.findOne({ where: { mobile } });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const getAllVendors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: vendors } = await User.findAndCountAll({
      where: {
        role: "VENDOR",
        is_active: true,
      },
      attributes: ["id", "name", "mobile", "email", "createdAt", "updatedAt"],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      success: true,
      data: {
        vendors,
        pagination: {
          totalRecords: count,
          totalPages,
          currentPage: page,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching vendors",
      error: error.message,
    });
  }
};
