import { Request, Response, Router } from "express";
import { MongoClient } from "mongodb";
import { DEFAULT_USER_ID } from "../constants";
import {
  depositController,
  getTransactions,
  withDrawController,
} from "./controller";
import { depositValidation, withdrawValidation } from "./validations";

const router: Router = require("express").Router();

module.exports = (dbDriver: MongoClient) => {
  router.get("/movements", async (req: Request, res: Response) => {
    try {
      const transactions = await getTransactions(DEFAULT_USER_ID, dbDriver);
      res.status(200).json({ transactions });
    } catch (error) {
      console.error(error);
      res.sendStatus(error?.resCode);
    }
  });
  router.post(
    "/withdraw",
    withdrawValidation,
    async (req: Request<null, null, { amount: number }>, res: Response) => {
      try {
        const { amount } = req.body;

        await withDrawController(DEFAULT_USER_ID, Math.abs(amount), dbDriver);

        res.sendStatus(204);
      } catch (error) {
        console.error(error);
        res.sendStatus(error?.resCode);
      }
    }
  );
  router.post(
    "/deposit",
    depositValidation,
    async (req: Request<null, null, { amount: number }>, res: Response) => {
      console.log("Deposit!");
      try {
        // Se podría recibir el userId en el body, cuando el usuario se haya logueado
        const { amount } = req.body;

        await depositController(DEFAULT_USER_ID, amount, dbDriver);

        res.sendStatus(204);
      } catch (error) {
        console.error(error);
        res.sendStatus(error?.resCode);
      }
    }
  );
  return router;
};
