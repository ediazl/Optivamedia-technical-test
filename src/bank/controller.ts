import { MongoClient, ObjectId, UpdateResult } from "mongodb";
import { DB_COLLECTIONS, DEFAULT_USER_ID } from "../constants";
import { ITransaction } from "../models/transactions";

export async function withDrawController(
  userId: string,
  amount: number,
  dbDriver: MongoClient
) {
  console.log("withdraw");

  const sesion = dbDriver.startSession();
  sesion.startTransaction({
    readConcern: { level: "snapshot" },
    writeConcern: { w: "majority" },
  });

  let res: UpdateResult = null;
  try {
    // TODO: hacerlo en una única operación para reducir carga en BD
    res = await dbDriver
      .db()
      .collection("bank")
      .updateOne(
        { _id: new ObjectId(userId) },
        {
          $cond: {
            if: { $gte: ["$amount", amount] },
            then: {
              $inc: { amount: -amount },
            },
            else: {
              $inc: { amount: 0 },
            },
          },
        },
        { session: sesion }
      );
  } catch (error) {
    console.error(error);
    throw {
      _id: "databaseError",
      resCode: 500,
    };
  }

  if (res.matchedCount === 0) {
    throw {
      _id: "userNotFound",
      resCode: 404,
    };
  }

  if (res.modifiedCount === 0) {
    throw {
      _id: "insufficientFunds",
      resCode: 409,
    };
  }

  try {
    const data: ITransaction = {
      date: new Date(),
      amount: amount,
    };
    await dbDriver.db().collection("transactions").insertOne(data);
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
      .find({ _id: new ObjectId(userId) })
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
// export async function depositController(amount: number, dbDriver: MongoClient) {
//   console.log("deposit");

//   try {
//     const data: Transactions = {
//       date: new Date(),
//       amount: amount,
//     };
//     await dbDriver.db().collection("bank").insertOne(data. {

//     });
//   } catch (error) {
//     console.error(error);
//     throw {
//       _id: "databaseError",
//       resCode: 500,
//     };
//   }
// }
