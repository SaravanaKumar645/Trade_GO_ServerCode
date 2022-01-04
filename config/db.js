const mongoose = require("mongoose");
require("dotenv").config();
const databaseURL = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.8sjto.mongodb.net/Tradego-mob?retryWrites=true&w=majority`;
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(databaseURL, {
      useNewUrlParser: true,
      writeConcern: {
        j: true,
        wtimeout: 50000,
      },
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected : ${conn.connection.host}`);
    console.log("Database Name::" + conn.connections[0].name);
  } catch (err) {
    console.log(err);
  }
};
module.exports = { connectDB };
