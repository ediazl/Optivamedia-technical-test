import bodyParser from "body-parser";
import express from "express";
import { MongoClient } from "mongodb";
import { ExitStatus, skipPartiallyEmittedExpressions } from "typescript";
import { DATABASE_NAME, MONGO_URI, PORT } from "./constants";
import { initMongo } from "./dbDriver";
const bankRoutes = require("./bank/routes");

const app = express();

async function init() {
  let dbClient = await initMongo(`${MONGO_URI}`);
  dbClient
    .db()
    .collections()
    .then((collections) => {
      console.log(collections);
    });
  process.on("SIGINT", function () {
    // this is only called on ctrl+c, not restart
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
