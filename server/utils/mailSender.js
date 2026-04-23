import nodemailer from "nodemailer";

const sanitizeEnvValue = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  return value.replace(/[\u00A0\u2007\u202F]/g, " ").trim();
};

const mailSender = async (email, title, body) => {
  try {
    const host = sanitizeEnvValue(process.env.MAIL_HOST);
    const user = sanitizeEnvValue(process.env.MAIL_USER);
    const pass = sanitizeEnvValue(process.env.MAIL_PASS);
    const fromName =
      sanitizeEnvValue(process.env.MAIL_FROM_NAME) || "LearnWell";
    const fromEmail = sanitizeEnvValue(process.env.MAIL_FROM_EMAIL) || user;

    if (!host || !user || !pass || host === "smtp.example.com") {
      const configurationError = new Error(
        "Email service is not configured. Please set valid MAIL_HOST, MAIL_USER, and MAIL_PASS values.",
      );
      configurationError.code = "MAIL_NOT_CONFIGURED";
      throw configurationError;
    }

    const transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.MAIL_PORT) || 587,
      secure: String(process.env.MAIL_SECURE).toLowerCase() === "true",
      auth: {
        user,
        pass,
      },
    });

    await transporter.verify();

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: `${email}`,
      subject: `${title}`,
      html: `${body}`,
    });

    return info;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};

export default mailSender;
