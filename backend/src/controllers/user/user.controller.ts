import { prisma } from "../../db/dbconnect.js";
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { SendVerificationEmail } from "../../helper/sendVerificationEmail.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import asyncHandler from "../../../utils/asyncHandler.js";

export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { username, email, password } = req.body;

      const existingUserByUsername = await prisma.user.findUnique({
        where: { username },
      });
      if (existingUserByUsername?.isVerified) {
        throw new ApiError(400, "Username already taken");
      }

      const existingUserByEmail = await prisma.user.findUnique({
        where: { email },
      });
      if (existingUserByEmail?.isVerified) {
        throw new ApiError(400, "User already exists with this email");
      }

      const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedPassword = await bcrypt.hash(password, 10);

      if (existingUserByEmail) {
        await prisma.user.update({
          where: { email },
          data: {
            username,
            password: hashedPassword,
            verifyCode,
          },
        });
      } else {
        await prisma.user.create({
          data: {
            username,
            email,
            password: hashedPassword,
            verifyCode,
          },
        });
      }

      const emailResponse = await SendVerificationEmail(
        email,
        username,
        verifyCode,
      );
      if (!emailResponse.success) {
        throw new ApiError(500, emailResponse.message);
      }

      return res
        .status(201)
        .json(new ApiResponse(201, "User registered successfully"));
    } catch (error) {
      if (error instanceof ApiError) throw error;
        console.error("FULL ERROR:", JSON.stringify(error, null, 2));  
  console.error("ERROR MESSAGE:", (error as Error).message);   
      console.error("Error registering user:", error);
      throw new ApiError(500, "Internal server error");
    }
  },
);
