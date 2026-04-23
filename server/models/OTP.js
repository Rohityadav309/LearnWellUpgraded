import mongoose from "mongoose";

import otpTemplate from "../mail/templates/emailVerificationTemplate.js";
import mailSender from "../utils/mailSender.js";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 5,
  },
});

const sendVerificationEmail = async (email, otp) => {
  try {
    const mailResponse = await mailSender(
      email,
      "Verification Email from LearnWell",
      otpTemplate(otp),
    );
    console.info("Email sent successfully", mailResponse.response);
  } catch (error) {
    console.error("Error occurred while sending verification email", error);

    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "Continuing signup flow without email delivery because the server is running in development mode.",
      );
      return;
    }

    throw error;
  }
};

otpSchema.pre("save", async function onSave(next) {
  try {
    if (this.isNew) {
      await sendVerificationEmail(this.email, this.otp);
    }

    next();
  } catch (error) {
    next(error);
  }
});

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;
