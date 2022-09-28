import { ObjectId } from "mongodb";

// export default class Transactions {
//   constructor(public amount: string, public date: Date, public id?: ObjectId) {}
// }

export interface ITransaction {
  amount: number;
  date: Date;
  type: string;
  _id?: ObjectId;
}
