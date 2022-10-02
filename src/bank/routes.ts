import { Request, Response, Router } from "express";
import { Double, MongoClient } from "mongodb";
import { DEFAULT_USER_ID } from "../constants";
import {
  depositController,
  getTransactions,
  withDrawController,
} from "./controller";
import { movementsValidation, withdrawDepositValidation } from "./validations";

const router: Router = require("express").Router();

module.exports = (dbDriver: MongoClient) => {
  router.get(
    "/movements/:userId",
    movementsValidation,
    async (req: Request, res: Response) => {
      try {
        const transactions = await getTransactions(DEFAULT_USER_ID, dbDriver);
        res.status(200).json({ transactions });
      } catch (error) {
        console.error(error);
        res.sendStatus(error?.resCode);
      }
    }
  );
  router.post(
    "/withdraw",
    withdrawDepositValidation,
    async (
      req: Request<null, null, { amount: number; userId: string }>,
      res: Response
    ) => {
      try {
        // Usuario de la transaccion,cuando haya login
        let { amount, userId } = req.body;

        console.log(amount);
        // Two decimals
        const amountDouble = Number.parseFloat(Math.abs(amount).toFixed(2));
        console.log("amountDouble");
        console.log(amountDouble);
        await withDrawController(
          DEFAULT_USER_ID,
          new Double(amountDouble),
          dbDriver
        );

        res.sendStatus(204);
      } catch (error) {
        console.error(error);
        res.sendStatus(error?.resCode);
      }
    }
  );
  router.post(
    "/deposit",
    withdrawDepositValidation,
    async (
      req: Request<null, null, { amount: number; userId: string }>,
      res: Response
    ) => {
      console.log("Deposit!");
      try {
        // Usuario de la transaccion,cuando haya login
        const { amount, userId } = req.body;
        const amountDouble = Number.parseFloat(Math.abs(amount).toFixed(2));
        console.log("amountDouble");
        console.log(amountDouble);
        await depositController(
          DEFAULT_USER_ID,
          new Double(amountDouble),
          dbDriver
        );

        res.sendStatus(204);
      } catch (error) {
        console.error(error);
        res.sendStatus(error?.resCode);
      }
    }
  );
  return router;
};
