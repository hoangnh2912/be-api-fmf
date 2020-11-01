const express = require("express");
const mongoose = require("mongoose");
const app = express();
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
require("dotenv/config");
app.use(bodyParser.json());
// connect to DB
mongoose.connect(
  process.env.DB_CONNECTION,
  { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false },
  (err) => {
    if (err) console.log(err);
    else console.log("connect to mongoDB success");
  }
);
console.clear();
//routes
const userRouter = require("./routes/user");
app.use("/api", userRouter);
app.get("/", (req, res) => {
  try {
    res.send("no message");
  } catch (error) {
    res.send("Error");
  }
});

// setInterval(() => {
//   fetch("https://find-my-family.herokuapp.com/").then((res) => {
//     res.text().then((res) => {
//       console.log(res);
//     });
//   });
// }, 1500000);

app.listen(process.env.PORT || 5000);
