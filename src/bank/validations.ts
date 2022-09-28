import { ObjectID } from "bson";
import { NextFunction, Request, Response } from "express";
export function withdrawValidation(
  req: Request<null, null, { amount: number }>,
  res: Response,
  next: NextFunction
) {
  const { amount } = req.body;
  console.log(typeof amount);
  console.log(amount);
  if (typeof amount !== "number" || amount <= 0) {
    res.status(400).json({ error: "Invalid amount" + amount });
  } else {
    next();
  }
}

export function depositValidation(
  req: Request<null, null, { amount: number }>,
  res: Response,
  next: NextFunction
) {
  console.log(JSON.stringify(req.body));
  const { amount } = req.body;
  console.log(typeof amount);
  console.log(amount);
  try {
    if (typeof amount !== "number" || amount <= 0) {
      res.status(400).json({ error: "Invalid amount " + amount });
    } else {
      next();
    }
  } catch (error) {
    res.status(400).json({ error: "BadParams" });
  }
}

export function movementsValidation(
  req: Request<{ userId: string }>,
  res: Response,
  next: NextFunction
) {
  const { userId } = req.params;
  if (!ObjectID.isValid(userId)) {
    res.status(400).send({ error: "BadParams" });
  } else {
    next();
  }
}
