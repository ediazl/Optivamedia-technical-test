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
// Verificar que estan bien definidas las variables de entorno, si no, lanzar un error
// for (let env_var of ["NODE_ENV", "PORT"]) {
//   console.log(env_var);
//   //   console.log(env_var, process.env[env_var]);
//   if (process.env[env_var] === undefined) {
//     console.error(`Variable de entorno ${env_var} no definida`);
//     process.exit(1);
//   }
// }
