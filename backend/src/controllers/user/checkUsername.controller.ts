/*
    for checking username

1. take username from req.query (or req.body)
2. validation - check if it's not empty and matches allowed format
3. find user by username in db
4. if user exists, return false (username taken)
5. if user doesn't exist, return true (username available)
6. return response

*/

import type { Request, Response, NextFunction } from "express"
import asyncHandler from "../../../utils/asyncHandler.js"
import { ApiError } from "../../../utils/ApiError.js"
import { usernameValidation } from "../../validators/signup/register.validator.js"
import {z} from "zod"
import { prisma } from "../../db/dbconnect.js"
import { ApiResponse } from "../../../utils/ApiResponse.js"

export const checkUsername = asyncHandler(async (req:Request, res: Response, next: NextFunction) => {
    // Express automatically parses query parameters into req.query
    const queryparams = { username: req.query.username }
    console.log("queryparams:",queryparams)

    const usernameValidationSchema = z.object({
        username: usernameValidation
    })
    
    const result = usernameValidationSchema.safeParse(queryparams)
    console.log("result:",result)
    
    if (!result.success) {
        throw new ApiError(400, "Invalid username format")
    }

    const {username} = result.data
    console.log(username);
    
    const verifiedUser = await prisma.user.findFirst({where: {username, isVerified: true}})

    if(verifiedUser){
        throw new ApiError(401, "username already taken")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "username available"))
})