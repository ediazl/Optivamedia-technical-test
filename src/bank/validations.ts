import { ObjectID } from "bson";
import { NextFunction, Request, Response } from "express";
export function withdrawDepositValidation(
  req: Request<null, null, { amount: number; userId: string }>,
  res: Response,
  next: NextFunction
) {
  const { amount, userId } = req.body;
  console.log(typeof amount);
  console.log(amount);
  try {
    if (typeof userId !== "string" || !ObjectID.isValid(userId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }
    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" + amount });
    }
    next();
  } catch (error) {
    res.status(400).json({ error: "BadParams" });
  }
}

export function movementsValidation(
  req: Request<{ userId: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { userId } = req.params;
    if (!ObjectID.isValid(userId)) {
      return res.status(400).send({ error: "BadParams" });
    }
    next();
  } catch (error) {
    res.status(400).json({ error: "BadParams" });
  }
}
