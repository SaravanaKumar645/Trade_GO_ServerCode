const mongoose = require("mongoose");
const dbConfig = require("./dbConfig");
var dbName = "";
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(dbConfig.database);

    dbName = conn.connections[0].name;
    console.log(`MongoDB connected : ${conn.connection.host}`);
    console.log("Database Name::" + conn.connections[0].name);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};
console.log(dbName);
module.exports = { connectDB, dbName };
