export const {
  NODE_ENV = "development",
  PORT = 3000,
  MONGO_URI,
  DATABASE_NAME,
} = process.env;

export const DEFAULT_USER_ID = "5f9f1b9b9c9d4b0b8c1c1c1c";
export const DB_COLLECTIONS = {
  transactions: "transactions",
  accounts: "accounts",
};
