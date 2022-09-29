import { ObjectId } from "mongodb";

export interface IAccount {
  balance: number;
  createdAt: Date;
  _id?: ObjectId;
}
