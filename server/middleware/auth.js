import jwt from "jsonwebtoken";

import User from "../models/User.js";

export const auth = async (req, res, next) => {
  try {
    const token =
      req.cookies.token ||
      req.body.token ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ success: false, message: "Token Missing" });
    }

    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decode;
    } catch {
      return res
        .status(401)
        .json({ success: false, message: "token is invalid" });
    }

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Something Went Wrong While Validating the Token",
    });
  }
};

export const isStudent = async (req, res, next) => {
  try {
    const userDetails = await User.findOne({ email: req.user.email });

    if (userDetails.accountType !== "Student") {
      return res.status(401).json({
        success: false,
        message: "This is a Protected Route for Students",
      });
    }

    next();
  } catch {
    return res
      .status(500)
      .json({ success: false, message: "User Role Can't be Verified" });
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    const userDetails = await User.findOne({ email: req.user.email });

    if (userDetails.accountType !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "This is a Protected Route for Admin",
      });
    }

    next();
  } catch {
    return res
      .status(500)
      .json({ success: false, message: "User Role Can't be Verified" });
  }
};

export const isInstructor = async (req, res, next) => {
  try {
    const userDetails = await User.findOne({ email: req.user.email });

    if (userDetails.accountType !== "Instructor") {
      return res.status(401).json({
        success: false,
        message: "This is a Protected Route for Instructor",
      });
    }

    next();
  } catch {
    return res
      .status(500)
      .json({ success: false, message: "User Role Can't be Verified" });
  }
};
