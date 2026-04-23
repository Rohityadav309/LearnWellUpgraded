import bcrypt from "bcryptjs";
import crypto from "crypto";

import User from "../models/User.js";
import mailSender from "../utils/mailSender.js";

export const resetPasswordToken = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `This email ${normalizedEmail} is not registered with us`,
      });
    }

    const token = crypto.randomBytes(20).toString("hex");

    await User.findOneAndUpdate(
      { email: normalizedEmail },
      {
        token,
        resetPasswordExpires: Date.now() + 3600000,
      },
      { new: true },
    );

    const clientUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const url = `${clientUrl}/update-password/${token}`;

    await mailSender(
      normalizedEmail,
      "Password Reset Link",
      `Your link for password reset is ${url}. Please open this URL to reset your password.`,
    );

    return res.status(200).json({
      success: true,
      message: "Email sent successfully. Please check your inbox.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while sending reset mail",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword, token } = req.body;

    if (!password || !confirmPassword || !token) {
      return res.status(400).json({
        success: false,
        message: "Password, confirm password, and token are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirm password do not match",
      });
    }

    const userDetails = await User.findOne({ token });

    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: "Token is invalid",
      });
    }

    if (userDetails.resetPasswordExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Token has expired. Please regenerate your token.",
      });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    await User.findOneAndUpdate(
      { token },
      {
        password: encryptedPassword,
        token: undefined,
        resetPasswordExpires: undefined,
      },
      { new: true },
    );

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Error occurred while updating password",
    });
  }
};
