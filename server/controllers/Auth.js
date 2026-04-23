import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";

import OTP from "../models/OTP.js";
import Profile from "../models/Profile.js";
import User from "../models/User.js";
import { passwordUpdated } from "../mail/templates/passwordUpdate.js";
import mailSender from "../utils/mailSender.js";

const getCookieOptions = (expiresInMs) => ({
  expires: new Date(Date.now() + expiresInMs),
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
});

const getAccessTokenPayload = (user) => ({
  email: user.email,
  id: user._id,
  accountType: user.accountType,
});

const signAccessToken = (user) =>
  jwt.sign(getAccessTokenPayload(user), process.env.JWT_SECRET, {
    expiresIn: "2h",
  });

const signRefreshToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      tokenType: "refresh",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

export const sendotp = async (req, res) => {
  try {
    const { email, accountType } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedAccountType = accountType?.trim();

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser && existingUser.accountType === normalizedAccountType) {
      return res.status(409).json({
        success: false,
        message: `${normalizedAccountType || "User"} is already registered`,
      });
    }

    if (existingUser && existingUser.accountType !== normalizedAccountType) {
      return res.status(409).json({
        success: false,
        message: `This email is already being used by a ${existingUser.accountType} account`,
      });
    }

    const isDevelopment = process.env.NODE_ENV !== "production";
    let otp = isDevelopment
      ? "123456"
      : otpGenerator.generate(6, {
          upperCaseAlphabets: false,
          lowerCaseAlphabets: false,
          specialChars: false,
        });

    if (!isDevelopment) {
      let existingOtp = await OTP.findOne({ otp });

      while (existingOtp) {
        otp = otpGenerator.generate(6, {
          upperCaseAlphabets: false,
          lowerCaseAlphabets: false,
          specialChars: false,
        });
        existingOtp = await OTP.findOne({ otp });
      }
    }

    await OTP.findOneAndDelete({ email: normalizedEmail });
    await OTP.create({ email: normalizedEmail, otp });

    return res.status(200).json({
      success: true,
      message: isDevelopment
        ? "Development OTP generated successfully"
        : "OTP sent successfully",
      ...(isDevelopment ? { devOtp: otp } : {}),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const signup = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType = "Student",
      contactNumber,
      otp,
    } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    const trimmedFirstName = firstName?.trim();
    const trimmedLastName = lastName?.trim();
    const normalizedOtp = otp?.trim();

    if (
      !trimmedFirstName ||
      !trimmedLastName ||
      !normalizedEmail ||
      !password ||
      !confirmPassword ||
      !normalizedOtp
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirm password do not match",
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists. Please sign in to continue.",
      });
    }

    const otpRecord = await OTP.findOne({ email: normalizedEmail }).sort({
      createdAt: -1,
    });

    if (!otpRecord || otpRecord.otp !== normalizedOtp) {
      return res.status(400).json({
        success: false,
        message: "The OTP is invalid",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const approved = accountType !== "Instructor";

    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: contactNumber || null,
    });

    const user = await User.create({
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      email: normalizedEmail,
      password: hashedPassword,
      accountType,
      approved,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(`${trimmedFirstName} ${trimmedLastName}`)}`,
    });

    await OTP.deleteMany({ email: normalizedEmail });

    const safeUser = user.toObject();
    delete safeUser.password;

    return res.status(201).json({
      success: true,
      user: safeUser,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "User cannot be registered. Please try again.",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (
      process.env.NODE_ENV !== "production" &&
      normalizedEmail === "demo@learnwell.local" &&
      password === "Demo@123"
    ) {
      const demoUser = {
        _id: "demo-user-id",
        firstName: "Demo",
        lastName: "User",
        email: "demo@learnwell.local",
        accountType: "Student",
        approved: true,
        additionalDetails: null,
        image: "https://api.dicebear.com/7.x/initials/svg?seed=Demo%20User",
      };

      const token = signAccessToken({
        _id: demoUser._id,
        email: demoUser.email,
        accountType: demoUser.accountType,
      });
      const refreshToken = signRefreshToken({ _id: demoUser._id });

      return res
        .cookie("token", token, getCookieOptions(2 * 60 * 60 * 1000))
        .cookie(
          "refreshToken",
          refreshToken,
          getCookieOptions(7 * 24 * 60 * 60 * 1000),
        )
        .status(200)
        .json({
          success: true,
          token,
          user: demoUser,
          message: "Demo login successful",
        });
    }

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email: normalizedEmail }).populate(
      "additionalDetails",
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User is not registered. Please sign up to continue",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Password is incorrect",
      });
    }

    const token = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    user.token = token;

    const safeUser = user.toObject();
    delete safeUser.password;

    return res
      .cookie("token", token, getCookieOptions(2 * 60 * 60 * 1000))
      .cookie(
        "refreshToken",
        refreshToken,
        getCookieOptions(7 * 24 * 60 * 60 * 1000),
      )
      .status(200)
      .json({
        success: true,
        token,
        user: safeUser,
        message: "User login successful",
      });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again",
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies.refreshToken;

    if (!incomingRefreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    const decoded = jwt.verify(incomingRefreshToken, process.env.JWT_SECRET);

    if (decoded.tokenType !== "refresh") {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const user = await User.findById(decoded.id).populate("additionalDetails");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found for refresh token",
      });
    }

    const accessToken = signAccessToken(user);

    return res
      .cookie("token", accessToken, getCookieOptions(2 * 60 * 60 * 1000))
      .status(200)
      .json({
        success: true,
        token: accessToken,
        message: "Token refreshed successfully",
      });
  } catch (error) {
    console.error("REFRESH TOKEN ERROR..............", error);
    return res.status(401).json({
      success: false,
      message: "Refresh token is invalid or expired",
    });
  }
};

export const logout = async (_req, res) => {
  return res
    .clearCookie("token", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })
    .clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })
    .status(200)
    .json({
      success: true,
      message: "Logged out successfully",
    });
};

export const changePassword = async (req, res) => {
  try {
    const userDetails = await User.findById(req.user.id);
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password,
    );

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "The old password is incorrect",
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }

    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUserDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: encryptedPassword },
      { new: true },
    );

    await mailSender(
      updatedUserDetails.email,
      "Password updated successfully",
      passwordUpdated(
        updatedUserDetails.email,
        `${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`,
      ),
    );

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error occurred while updating password", error);

    return res.status(500).json({
      success: false,
      message: "Error occurred while updating password",
      error: error.message,
    });
  }
};
