require("dotenv").config();
module.exports = {
  secret: "stonecold",
  database: `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.8sjto.mongodb.net/Tradego-mob
?retryWrites=true&w=majority`,
};
