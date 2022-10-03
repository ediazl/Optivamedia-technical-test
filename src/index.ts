import bodyParser from "body-parser";
import express from "express";
import { ExitStatus, skipPartiallyEmittedExpressions } from "typescript";
import { DATABASE_NAME, MONGO_URI, PORT } from "./constants";
import { initMongo } from "./dbDriver";

const bankRoutes = require("./bank/routes");

const app = express();

async function init() {
  let dbClient = await initMongo(`${MONGO_URI}`);

  // Si el proceso se cierra, cerrar la conexion a la BD
  process.on("SIGINT", function () {
    dbClient.close().then(() => {
      console.log("Database connection closed");
      process.exit(0);
    });
  });

  app.use(bodyParser.json());
  app.use("/api/v1/bank", bankRoutes(dbClient));
  app.use(express.static(__dirname + "/public"));
}

init()
  .then(() => {
    app.listen(PORT, () => {
      return console.log(`Express is listening at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error(error);
  });
