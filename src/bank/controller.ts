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

  if (!checkUserExists(dbDriver, userId)) {
    throw {
      _id: "userNotFound",
      resCode: 404,
    };
  }

  // const sesion = dbDriver.startSession();
  // sesion.startTransaction({
  //   readConcern: { level: "snapshot" },
  //   writeConcern: { w: "majority" },
  // });

  // Try to update the account
  let res: ModifyResult = null;
  try {
    // TODO: hacerlo en una única operación para reducir carga en BD
    res = await dbDriver
      .db()
      .collection(DB_COLLECTIONS.accounts)
      .findOneAndUpdate(
        { _id: new ObjectId(userId), balance: { $gte: amount } },
        {
          $inc: { balance: -amount },
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

  console.log(JSON.stringify(res));
  if (res.value === null || res.ok === 0) {
    throw {
      _id: "Could not make that operation",
      resCode: 409,
    };
  }

  // Create the transaction record
  try {
    const data: ITransaction = {
      userId: new ObjectId(userId),
      date: new Date(),
      type: "withdraw",
      amount,
      balance: (res.value as IAccount).balance,
    };
    await dbDriver.db().collection(DB_COLLECTIONS.transactions).insertOne(data);
  } catch (error) {
    // TODO: Delete update
    await dbDriver
      .db()
      .collection(DB_COLLECTIONS.accounts)
      .updateOne(
        { _id: new ObjectId(userId) },
        {
          $inc: { balance: amount },
        }
      );
    console.error(error);
    throw {
      _id: "databaseError",
      resCode: 500,
    };
  }
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

  if (!checkUserExists(dbDriver, userId)) {
    throw {
      _id: "userNotFound",
      resCode: 404,
    };
  }

  let res: ModifyResult = null;
  try {
    res = await dbDriver
      .db()
      .collection(DB_COLLECTIONS.accounts)
      .findOneAndUpdate(
        { _id: new ObjectId(userId) },
        {
          $inc: {
            balance: amount,
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

  if (res.value === null || res.ok === 0) {
    throw {
      _id: "Could not make that operation",
      resCode: 409,
    };
  }

  try {
    const data: ITransaction = {
      userId: new ObjectId(userId),
      date: new Date(),
      type: "deposit",
      amount,
      balance: (res.value as IAccount).balance, // Nueva cantidad
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
      _id: "userNotFound",
      resCode: 409,
    };
  }

  return transactions;
}

/**
 * Returns true if the user exists. False otherwise
 * @param dbDriver
 * @param userId
 * @returns
 */
async function checkUserExists(
  dbDriver: MongoClient,
  userId: string
): Promise<boolean> {
  let account: IAccount = null;
  try {
    account = await dbDriver
      .db()
      .collection<IAccount>(DB_COLLECTIONS.accounts)
      .findOne({ _id: new ObjectId(userId) });
  } catch (error) {
    console.error(error);
    throw {
      _id: "databaseError",
      resCode: 500,
    };
  }

  return account !== null;
}
