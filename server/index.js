import "dotenv/config";

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import fileUpload from "express-fileupload";

import { connectCloudinary } from "./config/cloudinary.js";
import { connectDatabase } from "./config/database.js";
import chatRoutes from "./routes/Chat.js";
import contactRoutes from "./routes/Contact.js";
import courseRoutes from "./routes/Course.js";
import paymentRoutes from "./routes/Payments.js";
import profileRoutes from "./routes/Profile.js";
import userRoutes from "./routes/User.js";

const app = express();
const port = Number(process.env.PORT) || 4000;
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
].filter(Boolean);

await connectDatabase();
connectCloudinary();

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  }),
);

app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/reach", contactRoutes);

app.get("/", (_request, response) => {
  response.status(200).json({
    success: true,
    message: "LearnWell backend is running.",
    author: "Rohit Yadav",
  });
});

app.use((error, _request, response, _next) => {
  console.error("Unhandled server error:", error);

  response.status(error?.status || 500).json({
    success: false,
    message: error?.message || "Internal server error",
  });
});

app.listen(port, () => {
  console.info(`LearnWell API listening on port ${port}.`);
});
