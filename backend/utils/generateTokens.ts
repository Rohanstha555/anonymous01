import jwt from "jsonwebtoken"

interface TokenPayload {
  id: string
  email: string
  username: string
}

export const generateAccessToken = (payload: TokenPayload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: (process.env.ACCESS_TOKEN_EXPIRY || "15m") as any,
  })
}

export const generateRefreshToken = (payload: Pick<TokenPayload, "id">) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: (process.env.REFRESH_TOKEN_EXPIRY || "7d") as any,
  })
}