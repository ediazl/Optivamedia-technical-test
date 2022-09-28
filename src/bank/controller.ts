import { ModifyResult, MongoClient, ObjectId, UpdateResult } from "mongodb";
import { DB_COLLECTIONS, DEFAULT_USER_ID } from "../constants";
import { IAccount } from "../models/accounts";
import { ITransaction } from "../models/transactions";

/**
 * Controller for substract from account
 * @param userId
 * @param amount positive integer
 * @param dbDriver
 */
export async function withDrawController(
  userId: string,
  amount: number,
  dbDriver: MongoClient
) {
  console.log("withdraw" + amount + " from " + userId);

  // const sesion = dbDriver.startSession();
  // sesion.startTransaction({
  //   readConcern: { level: "snapshot" },
  //   writeConcern: { w: "majority" },
  // });

  let res: ModifyResult = null;
  try {
    // TODO: hacerlo en una única operación para reducir carga en BD
    res = await dbDriver
      .db()
      .collection(DB_COLLECTIONS.accounts)
      .findOneAndUpdate(
        { _id: new ObjectId(userId) },
        [
          {
            $set: {
              amount: {
                $cond: {
                  if: { $gte: ["$amount", amount] },
                  then: {
                    $subtract: ["$amount", amount],
                  },
                  else: "$amount",
                },
              },
            },
          },
        ],
        {
          returnDocument: "after",
        }
      );
  } catch (error) {
    console.error(error);
    throw {
      _id: "databaseError",
      resCode: 500,
    };
  }

  console.log(JSON.stringify(res));
  if (res.ok === 0) {
    throw {
      _id: "userNotFound",
      resCode: 404,
    };
  }

  // if (res.modifiedCount === 0) {
  //   throw {
  //     _id: "insufficientFunds",
  //     resCode: 409,
  //   };
  // }

  try {
    const data: ITransaction = {
      userId: new ObjectId(userId),
      date: new Date(),
      type: "withdraw",
      amount,
      balance: res.value.amount,
    };
    await dbDriver.db().collection(DB_COLLECTIONS.transactions).insertOne(data);
  } catch (error) {
    console.error(error);
    throw {
      _id: "databaseError",
      resCode: 500,
    };
  }
}

export async function getTransactions(
  userId: string = DEFAULT_USER_ID,
  dbDriver: MongoClient
) {
  let transactions: ITransaction[] = null;
  try {
    transactions = await dbDriver
      .db()
      .collection<ITransaction>(DB_COLLECTIONS.transactions)
      .find({ userId: new ObjectId(userId) })
      .sort({ date: -1 })
      .toArray();
  } catch (error) {
    console.error(error);
    // TODO: crear clase que genere este formato de error
    throw {
      _id: "databaseError",
      resCode: 500,
    };
  }

  if (!transactions) {
    throw {
      _id: "notFound",
      resCode: 404,
    };
  }

  return transactions;
}

/**
 * Controller for increment account
 * @param userId
 * @param amount positive number
 * @param dbDriver
 */
export async function depositController(
  userId: string,
  amount: number,
  dbDriver: MongoClient
) {
  console.log("deposit");

  let res: ModifyResult = null;
  try {
    res = await dbDriver
      .db()
      .collection(DB_COLLECTIONS.accounts)
      .findOneAndUpdate(
        { _id: new ObjectId(userId) },
        {
          $inc: {
            amount,
          },
        },
        {
          returnDocument: "after",
        }
      );
  } catch (error) {
    console.error(error);
    throw {
      _id: "databaseError",
      resCode: 500,
    };
  }

  if (res === null || res.ok === 0) {
    throw {
      _id: "Could not make operation",
      resCode: 409,
    };
  }

  try {
    const data: ITransaction = {
      userId: new ObjectId(userId),
      date: new Date(),
      type: "deposit",
      amount,
      balance: (res.value as IAccount).amount, // Nueva cantidad
    };
    await dbDriver.db().collection(DB_COLLECTIONS.transactions).insertOne(data);
  } catch (error) {
    console.error(error);
    throw {
      _id: "databaseError",
      resCode: 500,
    };
  }
}
