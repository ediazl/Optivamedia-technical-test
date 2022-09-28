import { ObjectId } from "mongodb";

export interface IAccount {
  amount: number;
  createdAt: Date;
  _id?: ObjectId;
}
