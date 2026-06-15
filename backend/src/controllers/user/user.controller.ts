import { prisma } from "../../db/dbconnect.js";
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { SendVerificationEmail } from "../../helper/sendVerificationEmail.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";

export const registerUser = async (req: Request) => {
  try {
    const { username, email, password } = req.body;

    const existingUserVerifiedByUsername = await prisma.user.findUnique({
      where: {
        username,
        isVerified: true,
      },
    });

    if (existingUserVerifiedByUsername) {
      throw new ApiError(400, "username already taken");
    }

    const exisitingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (exisitingUserByEmail) {
      if (exisitingUserByEmail.isVerified) {

        throw new ApiError(400, "user already exist with this email");

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
      throw new ApiError(500, emailResponse.message);
    }

    return new ApiResponse(201, "User registered successfully");

  } catch (error) {
    console.error("Error registering user:", error);
    throw new ApiError(500, "internal server error");
  }
};
