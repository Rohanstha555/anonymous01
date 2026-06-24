import asyncHandler from "../../../utils/asyncHandler.js";
import type { Request, Response, NextFunction } from "express";
import { messageSchema } from "../../validators/message.validator.js";
import { prisma } from "../../db/dbconnect.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";

export const sendMessage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {

    const username = req.query.username as string;
    const {content} = req.body;

    console.log("username:", username);
    console.log("content:", content);
    

    const validatedData = messageSchema.parse({ content });

    const user = await prisma.user.findUnique({where: {username}})

    if(!user){
        throw new ApiError(400, "user not found ")
    }

    if(!user.isAccepingMessaages){
        throw new ApiError(401, "user is not Accepting messages")
    }

    const message = await prisma.message.create({ 
    data:{
        content: validatedData.content,
        createdAt: new Date(),
        userId: user.id
    }})
    console.log(message);
    

    return res
    .json(new ApiResponse(200, message, "Message sent successfully"))
  },
);
