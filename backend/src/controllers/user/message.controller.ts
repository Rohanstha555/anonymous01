import asyncHandler from "../../../utils/asyncHandler.js";
import type { Request, Response, NextFunction } from "express";
import { messageSchema } from "../../validators/message.validator.js";
import { prisma } from "../../db/dbconnect.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";

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

const groqApiKey = process.env.GROQ_AI_API_KEY;

if (!groqApiKey) {
  throw new Error("GROQ_AI_API_KEY is required");
}

const groq = createGroq({
  apiKey: groqApiKey,
});

export const suggestMessage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const prompt = `Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.`;

    const { text } = await generateText({
      prompt,
      model: groq("llama-3.1-8b-instant"),
    });

    const questions = text.split("||").map((q) => q.trim());

    return res.json(
      new ApiResponse(200, questions, "Random message suggested successfully"),
    );
  },
);
