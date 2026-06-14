import type { Request, Response, NextFunction } from "express";

const ayncHandler =
  (requestHandler: any) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await requestHandler(req, res, next);
    } catch (error) {
      next(error);
    }
  };

export default ayncHandler;
