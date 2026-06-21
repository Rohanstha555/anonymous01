/**
 * Steps for Authentication Middleware (verifyJWT):
 * 1. Extract the access token from the request cookies or authorization header.
 * 2. Check if the token is present, throw a 401 Unauthorized error if missing.
 * 3. Verify that the ACCESS_TOKEN_SECRET environment variable is configured.
 * 4. Decode and verify the JWT using the secret key to extract the user ID.
 * 5. Query the database to find the user associated with the decoded ID.
 * 6. If the user doesn't exist, throw a 401 Invalid Access Token error.
 * 7. Attach the retrieved user object to the request object (`req.user`).
 * 8. Call `next()` to proceed to the next middleware or route handler.
 */
import { prisma } from "../db/dbconnect.js"
import type { Request, Response, NextFunction } from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import jwt from "jsonwebtoken";

interface DecodedToken {
  id: string;
}
//res is not used so we can use "_" instead of res
export const verifyJWT = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const token =
    req.cookies?.accessToken ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized Access");
  }

  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new ApiError(500, "Server misconfiguration: missing ACCESS_TOKEN_SECRET");
  }

  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) as DecodedToken;

  const user = await prisma.user.findUnique({
    where: { id: decodedToken.id },
  });

  if (!user) {
    throw new ApiError(401, "Invalid Access Token");
  }

  req.user = user;
  next();
});