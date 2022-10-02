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

/**
 * Endpoint para obtener los movimientos de un usuario
 */
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

  /**
   * Endpoint para sacar en la cuenta de usuario una cantidad mayor a 0.01 eruso
   */
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
        await withDrawController(DEFAULT_USER_ID, new Double(amount), dbDriver);

        res.sendStatus(204);
      } catch (error) {
        console.error(error);
        res.status(error?.resCode).send({ error: error._id });
      }
    }
  );

  /**
   * Endpoint para depositar en la cuenta de usuario una cantidad mayor a 0.01 eruso
   */
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
        await depositController(DEFAULT_USER_ID, new Double(amount), dbDriver);

        res.sendStatus(204);
      } catch (error) {
        console.error(error);
        res.status(error?.resCode).send({ error: error._id });
      }
    }
  );
  return router;
};
