import { NextFunction, Request, Response } from "express";

export function withdrawValidation(
  req: Request<null, null, { amount: number }>,
  res: Response,
  next: NextFunction
) {
  const { amount } = req.body;
  if (amount <= 0) {
    res.status(400).send("The amount must be greater than 0");
  } else {
    next();
  }
}

export function depositValidation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { amount } = req.body;
  if (amount <= 0) {
    res.status(400).send("The amount must be greater than 0");
  } else {
    next();
  }
}
