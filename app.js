// Requirements and dependancies
require('dotenv').config()
const express = require("express"); // Express is required
const app = express(); // I'll use "app" for accesing express
const dayjs = require('dayjs') // Requiring dayjs for getting string of last update time
let date1 = dayjs(); // When i need to get exact time, i'll use date1 instead function
var relativeTime = require('dayjs/plugin/relativeTime'); // relativeTime dependancy for update time
dayjs.extend(relativeTime);
dayjs().format();
app.use(express.urlencoded({extended: true})); // Body-parser
app.use(express.static("public")); // Static method in order to access local files like css and images
app.set("view engine", "ejs"); // EJS is set
var _ = require('lodash'); // Lodash is required
const mongoose = require("mongoose"); // Mongoose is required

// Database connection
const connectDB = require("./config/database");
connectDB();

// Bring in models
const TradeItem = require("./models/tradeItem.js");
const BattleItem = require("./models/battleItem.js");

// Bring in functions
const updatePrice = require("./functions/calculationFunctions");

// Bring in route control functions
const { getHomePage, getProfitPage, getSelectedTypePage, postNewPrice } = require("./controllers/controlRouteFunctions");

// Routes
app.get("/", getHomePage);
app.get("/profit", getProfitPage);
app.get("/:selectedType", getSelectedTypePage);
app.post("/:selectedType/change", postNewPrice);


// Running the server
connectDB().then(function (){
  app.listen(process.env.PORT || 3000, function() {
    console.log("Server is on and ready to wrack baby");
  });
});
