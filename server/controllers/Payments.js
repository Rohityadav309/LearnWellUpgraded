import crypto from "crypto";
import mongoose from "mongoose";

import { instance } from "../config/razorpay.js";
import { courseEnrollmentEmail } from "../mail/templates/courseEnrollmentEmail.js";
import { paymentSuccessEmail } from "../mail/templates/paymentSuccessEmail.js";
import Course from "../models/Course.js";
import CourseProgress from "../models/CourseProgress.js";
import User from "../models/User.js";
import mailSender from "../utils/mailSender.js";

export const capturePayment = async (req, res) => {
  const { courses } = req.body;
  const userId = req.user.id;

  if (!instance) {
    return res.status(503).json({
      success: false,
      message: "Payment gateway is not configured",
    });
  }

  if (!Array.isArray(courses) || courses.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide course IDs" });
  }

  let totalAmount = 0;

  try {
    for (const courseId of courses) {
      const course = await Course.findById(courseId);

      if (!course) {
        return res
          .status(404)
          .json({ success: false, message: "Could not find the course" });
      }

      const uid = new mongoose.Types.ObjectId(userId);
      if (course.studentsEnrolled.some((studentId) => studentId.equals(uid))) {
        return res
          .status(409)
          .json({ success: false, message: "Student is already enrolled" });
      }

      totalAmount += Number(course.price || 0);
    }

    const paymentResponse = await instance.orders.create({
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    return res.status(200).json({
      success: true,
      data: paymentResponse,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Could not initiate order",
    });
  }
};

export const verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    courses,
  } = req.body;
  const userId = req.user.id;

  if (!instance) {
    return res.status(503).json({
      success: false,
      message: "Payment gateway is not configured",
    });
  }

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !courses ||
    !userId
  ) {
    return res.status(400).json({
      success: false,
      message: "Payment verification payload is incomplete",
    });
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ success: false, message: "Payment failed" });
  }

  try {
    await enrollStudents(courses, userId);

    return res.status(200).json({ success: true, message: "Payment verified" });
  } catch (error) {
    console.error("PAYMENT ENROLLMENT ERROR............", error);
    return res.status(500).json({
      success: false,
      message:
        "Payment was captured, but enrollment failed. Please contact support with the payment reference.",
    });
  }
};

export const sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body;
  const userId = req.user.id;

  if (!orderId || !paymentId || !amount || !userId) {
    return res.status(400).json({
      success: false,
      message: "Please provide all the details",
    });
  }

  try {
    const enrolledStudent = await User.findById(userId);

    await mailSender(
      enrolledStudent.email,
      "Payment Received",
      paymentSuccessEmail(
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
        amount / 100,
        orderId,
        paymentId,
      ),
    );

    return res.status(200).json({
      success: true,
      message: "Payment success email sent",
    });
  } catch (error) {
    console.error("Error in sending mail", error);
    return res
      .status(400)
      .json({ success: false, message: "Could not send email" });
  }
};

const enrollStudents = async (courses, userId) => {
  const session = await mongoose.startSession();
  const enrollmentEmails = [];

  try {
    await session.withTransaction(async () => {
      for (const courseId of courses) {
        const enrolledCourse = await Course.findByIdAndUpdate(
          courseId,
          { $addToSet: { studentsEnrolled: userId } },
          { new: true, session },
        );

        if (!enrolledCourse) {
          throw new Error("Course not found");
        }

        const courseProgress = await CourseProgress.create(
          [
            {
              courseID: courseId,
              userId,
              completedVideos: [],
            },
          ],
          { session },
        );

        const enrolledStudent = await User.findByIdAndUpdate(
          userId,
          {
            $addToSet: {
              courses: courseId,
              courseProgress: courseProgress[0]._id,
            },
          },
          { new: true, session },
        );

        if (!enrolledStudent) {
          throw new Error("Student not found");
        }

        enrollmentEmails.push({
          email: enrolledStudent.email,
          courseName: enrolledCourse.courseName,
          studentName: `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
        });
      }
    });

    for (const enrollmentEmail of enrollmentEmails) {
      await mailSender(
        enrollmentEmail.email,
        `Successfully enrolled into ${enrollmentEmail.courseName}`,
        courseEnrollmentEmail(
          enrollmentEmail.courseName,
          enrollmentEmail.studentName,
        ),
      );
    }
  } finally {
    await session.endSession();
  }
};
