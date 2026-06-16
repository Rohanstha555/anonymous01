import type { Request, Response, NextFunction } from "express";

const asyncHandler =
  (requestHandler: any) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await requestHandler(req, res, next);
    } catch (error) {
      next(error);
    }
  };

export default asyncHandler;
