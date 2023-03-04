// Models
const TradeItem = require("../models/tradeItem.js");
const BattleItem = require("../models/battleItem.js");

// Dayjs
const dayjs = require('dayjs') // Requiring dayjs for getting string of last update time
let date1 = dayjs(); // When i need to get exact time, i'll use date1 instead function
var relativeTime = require('dayjs/plugin/relativeTime'); // relativeTime dependancy for update time
dayjs.extend(relativeTime);
dayjs().format();

// Default parameters to work with
const selectedType = "";
const allTradeItemTypes = ["foraging", "logging", "mining", "hunting", "fishing", "excavating"];
const allBattleItemTypes = ["recovery", "offense", "utility", "buff", "cooking", "special"];

// Bring in functions
const updatePrice = require("../functions/calculationFunctions");

// Router for getting home page
const getHomePage = function(req, res){
  date1 = dayjs(); // to get exact "now" when client is entered the site
  BattleItem
    .find({}, function(err, battleItems) { // Find all Battle Item objects
      res.render("home", { // send "home.ejs"
        tradeItemDisplayed: battleItems, // "tradeItemDisplayed" in home.ejs is "tradeItems" in app.js find function
        date1: date1 // to show relative last update time
    });
  })
    .sort({
      profitRate: -1 // This sorts values descendantly according to profitRate (The highest profit rate first)
    })
    .limit(8) // Limits that only 8 return will be happen instead all.
};

// Router for getting profit page
const getProfitPage = function(req, res){
  date1 = dayjs(); // to get exact "now" when client is entered the site
  BattleItem
    .find({}, function(err, battleItems) { // Find all Battle Item objects
      res.render("profit", { // send "profit.ejs"
        tradeItemDisplayed: battleItems, // "tradeItemDisplayed" in profit.ejs is "tradeItems" in app.js find function
        date1: date1 // to show relative last update time
    });
  })
    .sort({
      profitRate: -1 // This sorts values descendingly according to profitRate (The highest profit rate first)
    });
};

// Router for getting the page whose type is selected
const getSelectedTypePage = function (req,res){
  const selectedType = req.params.selectedType; // Whatever is selected
  date1 = dayjs();  // to get exact "now" when client is entered the site
  var isBattleItem = allBattleItemTypes.includes(selectedType);
  var isTradeItem = allTradeItemTypes.includes(selectedType);

  if(isBattleItem){ // If the input is a type of battle item,
    BattleItem
    .find({type: selectedType }, // Query by selected type
      function(err, battleItems) {
        res.render("customHome", {
          tradeItemDisplayed: battleItems, // Display to user whatever selected
          selectedType: selectedType,
          date1: date1 // to show relative last update time
      });
    })
    .sort({
      customID: 1 // Sorts ascendingly like the same with the game
    });
  }

  else if(isTradeItem){ // If the input is a type of trade item,
    TradeItem
    .find({
      type: selectedType // Query by selected type
    }, function(err, tradeItems) {
      res.render("customHome", {
        tradeItemDisplayed: tradeItems, // Display to user whatever selected
        selectedType: selectedType,
        date1: date1 // to show relative last update time
      });
    })

    .sort({
      customID: 1 // Sorts ascendingly like the same with the game
    });
  }

  else if(isBattleItem==false && isTradeItem==false){
    res.sendStatus(404);
    console.log("This type of input doesnt exist");
  }else{
    console.log(err);
  }
};


// Router for posting new price for an item
const postNewPrice = async function (req, res){
  const selectedType = req.params.selectedType; // Whatever is selected type
  const requestedItemID = req.body.specificItem; // Gets the id of corresponding item (via hidden input's value)
  const changedPrice = req.body.newPrice; // Gets the price client has entered
  await updatePrice(requestedItemID, changedPrice, selectedType, res); // Updates the new price
};


module.exports = { getHomePage, getProfitPage, getSelectedTypePage, postNewPrice };
