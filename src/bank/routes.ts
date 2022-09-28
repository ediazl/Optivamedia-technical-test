import { Request, Response } from "express";
import { MongoClient } from "mongodb";
import { DEFAULT_USER_ID } from "../constants";
import { getTransactions, withDrawController } from "./controller";
import { depositValidation, withdrawValidation } from "./validations";

const router = require("express").Router();

module.exports = (dbDriver: MongoClient) => {
  router.get("/movements", async (req: Request, res: Response) => {
    try {
      await getTransactions(DEFAULT_USER_ID, dbDriver);
    } catch (error) {
      console.error(error);
      return res.status(500).sendStatus(error?.resCode);
    }
  });
  router.post(
    "/withdraw",
    withdrawValidation,
    async (req: Request<null, null, { amount: number }>, res: Response) => {
      try {
        const { amount } = req.body;

        await withDrawController(DEFAULT_USER_ID, amount, dbDriver);

        return res.sendStatus(204);
      } catch (error) {
        console.error(error);
        return res.sendStatus(error?.resCode);
      }
    }
  );
  // router.post(
  //   "/deposit",
  //   depositValidation,
  //   async (req: Request, res: Response) => {
  //     res.send("Deposit!");
  //     try {
  //       const { amount } = req.body;

  //       await withDrawController(amount, dbDriver);

  //       return res.sendStatus(204);
  //     } catch (error) {
  //       console.error(error);
  //       return res.sendStatus(error?.resCode);
  //     }
  //   }
  // );
  return router;
};
