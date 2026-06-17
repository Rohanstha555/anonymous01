import { prisma } from "../../db/dbconnect.js";
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { SendVerificationEmail } from "../../helper/sendVerificationEmail.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import asyncHandler from "../../../utils/asyncHandler.js";

export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
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
  },
);


export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const {username, email, password} = req.body
  const user = await prisma.user.findUnique({where: {
    username,
    email
  }})

  if(!user){
     throw new ApiError(400, "user not found")
  }

  const isPasswordcorrect = await bcrypt.compare(
    password,
    user.password
  )

  if(!isPasswordcorrect){
    throw new ApiError(401, "Incorrect Password")
  }
  // Remove password from the returned object for security
  const { password: _, ...loggedInUser } = user;

  return res
    .status(200)
    .json(new ApiResponse(200, loggedInUser, "User logged in successfully"));
})


/*      for register

1. make a function with parameter request
2. take details from req,body
3. validation- not empty
4. check if user already exist from username or email
5. check for images
6. upload them from cloudinary
7. create user object-create entry in db
8. remove password and refresh token in response
9. return response

*/