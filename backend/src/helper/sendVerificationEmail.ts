import nodemailer from "nodemailer"
import VerificationEmail from "../../Email/VerificationEmail.js";
import { render } from "@react-email/render";

export async function SendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string,
) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const emailHtml = await render(VerificationEmail({ username, otp: verifyCode }));

    await transporter.sendMail({
      from: `"Feedback App" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Feedback message verification Code",
      html: emailHtml,
    });

    return { success: true, message: "Verification email Send Successfully" };
  } catch (emailerror) {
    console.log("error sending email", emailerror);
    return { success: false, message: "Failed to Send Verification email" };
  }
}