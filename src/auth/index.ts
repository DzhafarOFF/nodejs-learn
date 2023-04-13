import { config } from "../config";
import { NextFunction, Request, Response } from "express";
import { getErrorResponseData } from "../helpers";
import jwt from "jsonwebtoken";

export const jwtMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.url === "/login") {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res
      .status(401)
      .json(getErrorResponseData("Missing Authorization header"));
  }

  const token = authHeader.split(" ")[1];

  try {
    jwt.verify(token, config.JWT_SECRET_KEY);
    next();
  } catch (error) {
    res.status(403).json(getErrorResponseData("Invalid JWT token"));
  }
};
