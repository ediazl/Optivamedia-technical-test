import { ObjectID } from "bson";
import { NextFunction, Request, Response } from "express";
import { Double } from "mongodb";
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
    if (typeof amount !== "number" || amount < 0.01) {
      return res.status(400).json({ error: "Invalid amount" + amount });
    }
    // Sanear los parametros Pasar a double
    console.log(Math.abs(amount).toFixed(2));
    console.log(+Math.abs(amount).toFixed(2));

    // Lo hago asi porque si me parseFloat redondea a dos decimales, ej. 0.55 -> 0.6
    req.body.amount = parseFloat(
      amount.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]
    );

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
