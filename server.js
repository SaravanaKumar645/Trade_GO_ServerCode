const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const db = require("./config/db");
const passport = require("passport");
const route = require("./routes/index");
const connectDB = db.connectDB;
const cookieParser = require("cookie-parser");
// const actions=require('./methods/actions')
// const sendsms=actions.send_OTP_SMS
// const verifysms=actions.verify_OTP_SMS
// heroku logs -a tradego-android-server --tail
console.log("hello");

connectDB();
//sendsms('6383562025')
//verifysms('6383562025','5681')
const app = express();
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(
  cors({
    origin: "*",
  })
);
app.use(cookieParser("hey"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(route);
app.use("/uploads", express.static("./uploads"));
app.use(passport.initialize());
require("./config/passport")(passport);

const PORT = process.env.PORT || 3123;
app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port : ${PORT}`
  )
);
