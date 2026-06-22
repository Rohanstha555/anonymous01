import { prisma } from "../../db/dbconnect.js";
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { SendVerificationEmail } from "../../helper/sendVerificationEmail.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import asyncHandler from "../../../utils/asyncHandler.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../../utils/generateTokens.js";
import jwt from "jsonwebtoken";

const generateAccessTokenAndRefreshToken = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const payload = {
      id: user.id,
      email: user.email,
      username: user.username,
    };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken: refreshToken,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating access or refresh token",
    );
  }
};

const ACCESS_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  maxAge: 15 * 60 * 1000, // 15 minutes — match this to whatever generateAccessToken signs into the JWT
};

const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
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
  /*
      for login

1. take details from body
2. find user
3. password check
4. access and refresh token
5. send token in cookies
6. response

*/
  const { username, email, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "username or email required");
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [...(email ? [{ email }] : []), ...(username ? [{ username }] : [])],
    },
  });

  if (!user) {
    throw new ApiError(400, "user not found");
  }

  const isPasswordcorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordcorrect) {
    throw new ApiError(401, "Incorrect Password");
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user.id);

  // Remove password from the returned object for security
  const { password: _, refreshToken: __, ...loggedInUser } = user;

  return res
    .status(200)
    .cookie("accessToken", accessToken, ACCESS_TOKEN_COOKIE_OPTIONS)
    .cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully",
      ),
    );
});

export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  await prisma.user.update({
    where: { id: req.user.id },
    data: { refreshToken: null },
  });

  return res
    .status(200)
    .clearCookie("accessToken", ACCESS_TOKEN_COOKIE_OPTIONS)
    .clearCookie("refreshToken", REFRESH_TOKEN_COOKIE_OPTIONS)
    .json(new ApiResponse(200, "Logout successful"));
});

export const refreshAccessToken = asyncHandler(
  async (req: Request, res: Response) => {
    /*
      for refreshAccessToken

1. Get the refresh token from the cookies or request body
2. Check if the token is present (throw error if not)
3. Verify the refresh token using JWT
4. Find the user in the database using the decoded token information
5. Check if the token matches the refresh token stored in the user's database record
6. Generate a new access token (and optionally a new refresh token)
7. Send the new tokens in cookies
8. Return response
*/

    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
      throw new ApiError(401, "unauthorized Access");
    }
    console.log("incomingRefreshToken:", incomingRefreshToken);
    

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET as string,
    ) as jwt.JwtPayload & { id: string };

    console.log("decodedToken:",decodedToken)

    const user = await prisma.user.findUnique({
      where: { id: decodedToken.id },
    });
    console.log(user);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(402, "invalid or expired token");
    }

    const { accessToken, refreshToken } =
      await generateAccessTokenAndRefreshToken(user.id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, ACCESS_TOKEN_COOKIE_OPTIONS)
      .cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access Token refreshed",
        ),
      );
  },
);

