import asyncHandler from "../../../utils/asyncHandler.js";
import type { Request, Response, NextFunction } from "express";
import { messageSchema } from "../../validators/message.validator.js";
import { prisma } from "../../db/dbconnect.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import type { User } from "../../generated/prisma/index.js";

export const sendMessage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const username = req.query.username as string;
    const { content } = req.body;

    console.log("username:", username);
    console.log("content:", content);

    const validatedData = messageSchema.parse({ content });

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      throw new ApiError(400, "user not found ");
    }

    if (!user.isAccepingMessaages) {
      throw new ApiError(401, "user is not Accepting messages");
    }

    const message = await prisma.message.create({
      data: {
        content: validatedData.content,
        createdAt: new Date(),
        userId: user.id,
      },
    });
    console.log(message);

    return res.json(new ApiResponse(200, message, "Message sent successfully"));
  },
);

export const getMessage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized. Please log in.");
    }

    const userId = req.user.id;
    console.log(userId);

    if (!userId) {
      throw new ApiError(400, "Invalid user ID");
    }

    const message = await prisma.message.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    console.log(message);

    if (!message || message.length === 0) {
      throw new ApiError(404, "No Message found");
    }

    return res.json(
      new ApiResponse(200, message, "Message Fetched Successfully"),
    );
  },
);

export const getAcceptMessage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized. Please log in.");
    }

    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        isAccepingMessaages: true,
      },
    });

    if (!user) {
      throw new ApiError(404, "user not found");
    }

    return res.json(new ApiResponse(200, user.isAccepingMessaages));
  },
);

export const postAcceptMessage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized. Please log in.");
    }

    const userId = req.user.id;
    const { acceptMessage } = req.body;
    console.log("userId:", userId + "accepMessage:", acceptMessage);

    await prisma.user.update({
      where: { id: userId },
      data: {
        isAccepingMessaages: acceptMessage,
      },
    });

    return res.json(new ApiResponse(200, "status updated successfully"));
  },
);

export const deleteMessage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized. Please log in.");
    }

    const userId = req.user.id;
    const { messageId } = req.params;
    console.log("userId:", userId);
    console.log("messageId:", messageId);

    if (!userId) {
      throw new ApiError(400, "Invalid user ID");
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId as string },
    });

    if (!message) {
      throw new ApiError(404, "message not found");
    }

    if (message.userId !== userId) {
      throw new ApiError(403, "You are not authorized to delete this message");
    }

    await prisma.message.delete({ where: { id: messageId as string } });

    return res.json(new ApiResponse(200, "Message Deleted Successfully"));
  },
);
