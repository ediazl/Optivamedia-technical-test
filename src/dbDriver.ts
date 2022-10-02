import { Double, MongoClient, ObjectId } from "mongodb";
import { DB_COLLECTIONS, DEFAULT_USER_ID } from "./constants";

export async function initMongo(url: string) {
  try {
    console.log(url);
    let db = await new MongoClient(url).connect();
    console.log("Connected to MongoDB");
    // Delete old data when starting app
    await db
      .db()
      .collection(DB_COLLECTIONS.accounts)
      .updateOne(
        {
          _id: new ObjectId(DEFAULT_USER_ID),
        },
        {
          // Default data for testint
          $set: {
            balance: new Double(1000),
            createdAt: new Date(),
          },
        },
        {
          upsert: true,
        }
      );

    await db.db().collection(DB_COLLECTIONS.transactions).deleteMany({});
    return db;
  } catch (error) {
    console.error(error);
    throw new Error("Could not connect to database");
  }
}
