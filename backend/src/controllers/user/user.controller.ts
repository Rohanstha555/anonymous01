import { prisma } from "../../db/dbconnect.js";
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { SendVerificationEmail } from "../../helper/sendVerificationEmail.js";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    const existingUserVerifiedByUsername = await prisma.user.findUnique({
      where: {
        username,
        isVerified: true,
      },
    });

    if (existingUserVerifiedByUsername) {
      return res.status(400).json({
        success: false,
        message: "username already taken",
      });
    }

    const exisitingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (exisitingUserByEmail) {
      if (exisitingUserByEmail.isVerified) {
        return res.status(400).json({
          success: false,
          message: "user already exist with this email",
        });
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
          where: { email },
          data: {
            password: hashedPassword,
            verifyCode,
          },
        });
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          verifyCode,
        },
      });
    }

    //send verifivcation email
    const emailResponse = await SendVerificationEmail(
      email,
      username,
      verifyCode,
    );

    if (!emailResponse.success) {
      return Response.json({
        success: false,
        message: emailResponse.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
