// Requirements and dependancies
require('dotenv').config()
const express = require("express"); // Express is required
const app = express(); // I'll use "app" for accesing express

app.use(express.urlencoded({extended: true})); // Body-parser
app.use(express.static("public")); // Static method in order to access local files like css and images
app.set("view engine", "ejs"); // EJS is set

// Database connection
const connectDB = require("./config/database");

// Bring in models
const TradeItem = require("./models/tradeItem.js");
const BattleItem = require("./models/battleItem.js");

// Routes
const router = require("./routes/itemRoutes");
app.use("/", router);

// Running the server
connectDB().then(function (){
  app.listen(process.env.PORT || 3000, function() {
    console.log("Server is on and ready to wrack baby");
  });
});
