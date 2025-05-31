"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectMongo = connectMongo;
const mongodb_1 = require("mongodb");
function connectMongo() {
    const { MONGO_USER, MONGO_PWD, MONGO_CLUSTER, DB_NAME } = process.env;
    const redacted = `mongodb+srv://${MONGO_USER}:<password>@${MONGO_CLUSTER}/${DB_NAME}`;
    const connectionString = `mongodb+srv://${MONGO_USER}:${MONGO_PWD}@${MONGO_CLUSTER}/${DB_NAME}`;
    console.log("Connecting to", redacted);
    return new mongodb_1.MongoClient(connectionString);
}
