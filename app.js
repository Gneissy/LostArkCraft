// Requirements and dependancies
require('dotenv').config()
const express = require("express"); // Express is required
const app = express(); // I'll use "app" for accesing express
const https = require("https"); // https is required for get request
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

const connectDB = async function(){
  try {
    const conn = await mongoose.connect(process.env.MONGOSERVER);
    console.log("MongoDB is connected");
  }catch(err){
    console.log(err);
    process.exit(1);
  }
}


mongoose.connect(process.env.MONGOSERVER); // Connecting Mongo Database, Collection & Mongo Atlas

// Creating a DB Schema
const tradeItemSchema = new mongoose.Schema({ // This allows us to record posts in database
  name: String,
  customID: Number,
  type: String,
  rarity: String,
  bundle: Number,
  price: Number,
  lastUpdate: Date
});
// Creating the Collection
const TradeItem = mongoose.model("TradeItem", tradeItemSchema); // "tradeItems" collection is created.


// Default parameters & variables
const requiredTradeItems = [];
const selectedType = "";
const allTradeItemTypes = ["foraging", "logging", "mining", "hunting", "fishing", "excavating"];
const allBattleItemTypes = ["recovery", "offense", "utility", "buff"];

// Temporary parameters & variables (needed for creating new battle items)
const requiredTradeItemsString = ["Exquisite Mushroom", "Fresh Mushroom", "Sturdy Timber", "Rare Relic", "Crude Mushroom"];
const requiredTradeItemsQuantity = ["5","20","2","4","40"];



// Creating another DB Schema which is for Battle Items
const battleItemSchema = new mongoose.Schema({
  name: String, // Major HP Potion
  customID: Number, // 1
  type: String, // Recovery
  rarity: String, // Rare
  price: Number, // 10
  lastUpdate: Date, // dayjs object
  requirements: requiredTradeItems, // [Shy Wild Flower, Wild Flower]
  requirementQuantities: requiredTradeItemsQuantity, // [4, 10]
  perCraftCost: Number, // 14
  perCraftQuantity: Number, // 3
  perCraftTimeSecond: Number, // 25
  profitRate: Number
});
// Creating the other collection which is BattleItems
const BattleItem = mongoose.model("BattleItem", battleItemSchema); // "battleItems" collection is created





// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Functions
// In order to update price for both main page and specific type pages
function updatePrice(requestedItemID, changedPrice, selectedType, res){
  var isBattleItem = allBattleItemTypes.includes(selectedType);
  var isTradeItem = allTradeItemTypes.includes(selectedType);

  if (isBattleItem){ // If its a type of Battle item,
    BattleItem.findOneAndUpdate( // Updating the object's price property
      {
        _id: requestedItemID // Finds the object,
      }, {
        $set: {
          price: changedPrice // Updates the price.
        }
      },
      function(err, result) { // i couldn't make async await here, it just doesnt work properly for some reason
        if (!err) {
          console.log("---");
          console.log(result.name + "'s price is changed to " + changedPrice);
          var lastUpdate = dayjs();
          BattleItem.findOneAndUpdate(
            {
              _id: requestedItemID
            }, {
              $set:{
                lastUpdate: lastUpdate // setting the last update time
              }
            }, {new: true}, function(err){
            if(!err){
              console.log("Last update date for "+result.name+" is up to date now.");
              console.log("---");
               // Calculate and set values of related battle items' profit rate after battle item's price change
              calculateProfit(result.name);
            }else{
              console.log(err);
            }
          });
        // console.log(lastUpdate); // just to control what we got
          res.redirect("/"+ selectedType);
        } else {
          console.log(err);
        }
      });
  }

  else if(isTradeItem){ // If its a type of Trade item,
    TradeItem.findOneAndUpdate( // Updating the object's price property
      {
        _id: requestedItemID // Finds the object,
      }, {
        $set: {
          price: changedPrice // Updates the price.
        }
      },
      function(err, result) { // i couldn't make async await here, it just doesnt work properly for some reason
        if (!err) {
          console.log("---");
          console.log(result.name + "'s price is changed to " + changedPrice);
          var lastUpdate = dayjs();
          TradeItem.findOneAndUpdate(
            {
              _id: requestedItemID
            }, {
              $set:{
                lastUpdate: lastUpdate // setting the last update time
              }
            }, {new: true}, function(err){
            if(!err){
              console.log("Last update date for "+result.name+" is up to date now.");
              console.log("---");
               // Calculate and set values of related battle items' profit rate after its required trade item's price
              calculateProfitAfterChangingPrice(result.name);
            }else{
              console.log(err);
            }
          });
        // console.log(lastUpdate); // just to control what we got
          res.redirect("/"+ selectedType);
        } else {
          console.log(err);
        }
      });
  }
}

// temp
// Creating new Battle Item
function createNewBattleItem(name, customID, type, rarity, price, perCraftCost, perCraftQuantity, perCraftTimeSecond){
  const newBattleItem = new BattleItem({ // This is an example object
    name: name,
    customID: customID,
    type: type,
    rarity: rarity,
    price: price,
    perCraftCost: perCraftCost,
    perCraftQuantity: perCraftQuantity,
    perCraftTimeSecond: perCraftTimeSecond
  });
  newBattleItem.save(function (err){
    console.log(newBattleItem.name + " is saved into Database.");
  });
}


// temp
// Updating existing battle item's requirements
function updateBattleItem(battleItem, requiredTradeItemsString, requiredTradeItemsQuantity){ // i is how many types of material required
    BattleItem.findOneAndUpdate({name:battleItem},
      {
        $set:
        {
          requirements: requiredTradeItemsString,
          requirementQuantities: requiredTradeItemsQuantity
        }
      }, {new: true}, function(err, foundObject){
      console.log(foundObject.name + "'s requirements are successfully updated.");
    });
  }

  // createNewBattleItem("Stimulant", 30, "buff", "epic", 58, 30, 3, 3600);
  // updateBattleItem("Stimulant", requiredTradeItemsString, requiredTradeItemsQuantity);








async function calculateProfit(battleItem){ // This works properly, calculates the corresponding battle item's profit rate
  BattleItem.find({name: battleItem}, function(err,foundItem){

    var battleItemSellingPrice = foundItem[0].price; // Battle Item's selling price
    var battleItemPerCraftCost = foundItem[0].perCraftCost; // Batle Item's crafting cost
    var battleItemPerCraftQuantity = foundItem[0].perCraftQuantity; // How many craft is supplied per craft process
    var battleItemMarketFee = Math.ceil(battleItemSellingPrice/20); // Fee price per Battle Item
    var allTradeItemsCost = 0;

      // The reason im doing it one by one is that i can't use for loop properly in this situation.
      const calculateProfitForIndex0 = async function(){
        setTimeout(function(){
          if(foundItem[0].requirements.length > 0){ // If requirement quantity is bigger than 0,
            TradeItem.find({name: foundItem[0].requirements[0]}, function (err, foundTradeItem){ // Find corresponding trade item
              var tradeItemPrice = foundTradeItem[0].price; // Trade Item's bundle price
              var tradeItemBundle = foundTradeItem[0].bundle; // Trade Item's bundle quantity (10 or 100)
              var tradeItemRequirementQuantity = foundItem[0].requirementQuantities[0]; // How many of them we need

              var tradeItemCost = (tradeItemPrice / tradeItemBundle) * tradeItemRequirementQuantity; // Calculation of the cost of trade item
              allTradeItemsCost += tradeItemCost; // Adding the sum of all trade items
              // console.log(allTradeItemsCost);
              if (foundItem[0].requirements.length == 1){
                var allCraftingCost = ((allTradeItemsCost + battleItemPerCraftCost) / battleItemPerCraftQuantity) + battleItemMarketFee;
                var profitRate = (battleItemSellingPrice / allCraftingCost) * 100;
                BattleItem.findOneAndUpdate({name:battleItem},
                  {
                    $set:
                    {
                      profitRate: profitRate
                    }
                  }, {new: true}, function(err, foundObject){
                  console.log(foundObject.name + "'s profit rate is updated as "+ profitRate);
                });
              }
             });
          }
        }, 200);
      }

      const calculateProfitForIndex1 = async function(){
        setTimeout(function(){
          if(foundItem[0].requirements.length > 1){ // If requirement quantity is bigger than 1,
            TradeItem.find({name: foundItem[0].requirements[1]}, function (err, foundTradeItem){ // Find corresponding trade item
              var tradeItemPrice = foundTradeItem[0].price; // Trade Item's bundle price
              var tradeItemBundle = foundTradeItem[0].bundle; // Trade Item's bundle quantity (10 or 100)
              var tradeItemRequirementQuantity = foundItem[0].requirementQuantities[1]; // How many of them we need

              var tradeItemCost = (tradeItemPrice / tradeItemBundle) * tradeItemRequirementQuantity; // Calculation of the cost of trade item
              allTradeItemsCost += tradeItemCost; // Adding the sum of all trade items
              // console.log(allTradeItemsCost);
              if (foundItem[0].requirements.length == 2){
                var allCraftingCost = ((allTradeItemsCost + battleItemPerCraftCost) / battleItemPerCraftQuantity) + battleItemMarketFee;
                var profitRate = (battleItemSellingPrice / allCraftingCost) * 100;
                BattleItem.findOneAndUpdate({name:battleItem},
                  {
                    $set:
                    {
                      profitRate: profitRate
                    }
                  }, {new: true}, function(err, foundObject){
                  console.log(foundObject.name + "'s profit rate is updated as "+ profitRate);
                });
              }
             });
          }
        }, 400);
      } // Required 50 ms setTimeout

      const calculateProfitForIndex2 = async function(){
        setTimeout(function(){
          if(foundItem[0].requirements.length > 2){ // If requirement quantity is bigger than 1,
            TradeItem.find({name: foundItem[0].requirements[2]}, function (err, foundTradeItem){ // Find corresponding trade item
              var tradeItemPrice = foundTradeItem[0].price; // Trade Item's bundle price
              var tradeItemBundle = foundTradeItem[0].bundle; // Trade Item's bundle quantity (10 or 100)
              var tradeItemRequirementQuantity = foundItem[0].requirementQuantities[2]; // How many of them we need

              var tradeItemCost = (tradeItemPrice / tradeItemBundle) * tradeItemRequirementQuantity; // Calculation of the cost of trade item
              allTradeItemsCost += tradeItemCost; // Adding the sum of all trade items
              // console.log(allTradeItemsCost);
              if (foundItem[0].requirements.length == 3){
                var allCraftingCost = ((allTradeItemsCost + battleItemPerCraftCost) / battleItemPerCraftQuantity) + battleItemMarketFee;
                var profitRate = (battleItemSellingPrice / allCraftingCost) * 100;
                BattleItem.findOneAndUpdate({name:battleItem},
                  {
                    $set:
                    {
                      profitRate: profitRate
                    }
                  }, {new: true}, function(err, foundObject){
                  console.log(foundObject.name + "'s profit rate is updated as "+ profitRate);
                });
              }
             });
          }
        }, 600);
      } // Required 50 ms setTimeout

      const calculateProfitForIndex3 = async function(){
        setTimeout(function(){
          if(foundItem[0].requirements.length > 3){ // If requirement quantity is bigger than 1,
            TradeItem.find({name: foundItem[0].requirements[3]}, function (err, foundTradeItem){ // Find corresponding trade item
              var tradeItemPrice = foundTradeItem[0].price; // Trade Item's bundle price
              var tradeItemBundle = foundTradeItem[0].bundle; // Trade Item's bundle quantity (10 or 100)
              var tradeItemRequirementQuantity = foundItem[0].requirementQuantities[3]; // How many of them we need

              var tradeItemCost = (tradeItemPrice / tradeItemBundle) * tradeItemRequirementQuantity; // Calculation of the cost of trade item
              allTradeItemsCost += tradeItemCost; // Adding the sum of all trade items
              // console.log(allTradeItemsCost);
              if (foundItem[0].requirements.length == 4){
                var allCraftingCost = ((allTradeItemsCost + battleItemPerCraftCost) / battleItemPerCraftQuantity) + battleItemMarketFee;
                var profitRate = (battleItemSellingPrice / allCraftingCost) * 100;
                BattleItem.findOneAndUpdate({name:battleItem},
                  {
                    $set:
                    {
                      profitRate: profitRate
                    }
                  }, {new: true}, function(err, foundObject){
                  console.log(foundObject.name + "'s profit rate is updated as "+ profitRate);
                });
              }
             });
          }
        }, 800);
      } // Required 50 ms setTimeout

      const calculateProfitForIndex4 = async function(){
        setTimeout(function(){
          if(foundItem[0].requirements.length > 4){ // If requirement quantity is bigger than 1,
            TradeItem.find({name: foundItem[0].requirements[4]}, function (err, foundTradeItem){ // Find corresponding trade item
              var tradeItemPrice = foundTradeItem[0].price; // Trade Item's bundle price
              var tradeItemBundle = foundTradeItem[0].bundle; // Trade Item's bundle quantity (10 or 100)
              var tradeItemRequirementQuantity = foundItem[0].requirementQuantities[4]; // How many of them we need

              var tradeItemCost = (tradeItemPrice / tradeItemBundle) * tradeItemRequirementQuantity; // Calculation of the cost of trade item
              allTradeItemsCost += tradeItemCost; // Adding the sum of all trade items
              // console.log(allTradeItemsCost);
              if (foundItem[0].requirements.length == 5){
                var allCraftingCost = ((allTradeItemsCost + battleItemPerCraftCost) / battleItemPerCraftQuantity) + battleItemMarketFee;
                var profitRate = (battleItemSellingPrice / allCraftingCost) * 100;
                BattleItem.findOneAndUpdate({name:battleItem},
                  {
                    $set:
                    {
                      profitRate: profitRate
                    }
                  }, {new: true}, function(err, foundObject){
                  console.log(foundObject.name + "'s profit rate is updated as "+ profitRate);
                });
              }
             });
          }
        }, 1000);
      } // Required 50 ms setTimeout

      const calculateProfitForIndex5 = async function(){
        setTimeout(function(){
          if(foundItem[0].requirements.length > 5){ // If requirement quantity is bigger than 1,
            TradeItem.find({name: foundItem[0].requirements[5]}, function (err, foundTradeItem){ // Find corresponding trade item
              var tradeItemPrice = foundTradeItem[0].price; // Trade Item's bundle price
              var tradeItemBundle = foundTradeItem[0].bundle; // Trade Item's bundle quantity (10 or 100)
              var tradeItemRequirementQuantity = foundItem[0].requirementQuantities[5]; // How many of them we need

              var tradeItemCost = (tradeItemPrice / tradeItemBundle) * tradeItemRequirementQuantity; // Calculation of the cost of trade item
              allTradeItemsCost += tradeItemCost; // Adding the sum of all trade items
              // console.log(allTradeItemsCost);
              if (foundItem[0].requirements.length == 6){
                var allCraftingCost = ((allTradeItemsCost + battleItemPerCraftCost) / battleItemPerCraftQuantity) + battleItemMarketFee;
                var profitRate = (battleItemSellingPrice / allCraftingCost) * 100;
                BattleItem.findOneAndUpdate({name:battleItem},
                  {
                    $set:
                    {
                      profitRate: profitRate
                    }
                  }, {new: true}, function(err, foundObject){
                  console.log(foundObject.name + "'s profit rate is updated as "+ profitRate);
                });
              }
             });
          }
        }, 1200);
      } // Required 50 ms setTimeout

      function calculateOverallProfit(){ // This function lets me async execution
        calculateProfitForIndex0()
        .then(calculateProfitForIndex1)
        .then(calculateProfitForIndex2)
        .then(calculateProfitForIndex3)
        .then(calculateProfitForIndex4)
        .then(calculateProfitForIndex5);
      }

      calculateOverallProfit();
});
}


// This function is used for re-calculating related battle items' profit rate after changing a trade item's price
// This function will be used when trade or battle item price change process. (Essentially updatePrice function)
function calculateProfitAfterChangingPrice(foundTradeItem){ // foundTradeItem is basically the trade item whose price is changed.
 BattleItem.find({requirements: foundTradeItem}, async function(err, foundItem){ // Find all battle items related to the trade item whose price is changed
      for(var i=0; i< foundItem.length; i++){ // No need to be async
          await calculateProfit(foundItem[i].name);
      }
  });
}


function calculateEfficiency(){
  // Here will be the same calculateProfit() with addition of time parameter
}


async function setProfitValue(battleItem, profitRate){
  await BattleItem.findOneAndUpdate({name: battleItem}, {$set:{profitRate: profitRate}}, {new: true}, function(err, foundObject){console.log(foundObject+"'s profit rate is updated.");});
}




//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Get requests
app.get("/", function(req, res) { // Home Page as home.ejs
  date1 = dayjs(); // to get exact "now" when client is entered the site
  BattleItem
    .find({}, function(err, battleItems) { // Find Horse objects having "" properties (all)
      res.render("home", { // send "home.ejs"
        tradeItemDisplayed: battleItems, // "tradeItemDisplayed" in home.ejs is "tradeItems" in app.js find function
        date1: date1 // to show relative last update time
    });
  })
    .sort({
      profitRate: -1 // This sorts values descendantly according to profitRate (The highest profit rate first)
    })
    .limit(8) // Limits that only 8 return will be happen instead all.
});

app.get("/profit", function(req, res) { // Home Page as home.ejs
  date1 = dayjs(); // to get exact "now" when client is entered the site
  BattleItem
    .find({}, function(err, battleItems) { // Find Horse objects having "" properties (all)
      res.render("profit", { // send "home.ejs"
        tradeItemDisplayed: battleItems, // "tradeItemDisplayed" in home.ejs is "tradeItems" in app.js find function
        date1: date1 // to show relative last update time
    });
  })
    .sort({
      profitRate: -1 // This sorts values descendantly according to profitRate (The highest profit rate first)
    });
});

app.get("/:selectedType", function(req, res) { // Be selected with dropdown menu
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
});



//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Post Requests
app.post("/", function(req, res) { // Post request (when someone pressed submit button)
  const newTradeItem = new TradeItem({ // Creating a new object
    name: req.body.newItemName,
    customID: req.body.newItemCustomID,
    type: req.body.newItemType,
    rarity: req.body.newItemRarity,
    bundle: req.body.newItemBundle,
    price: req.body.newItemPrice
  });
  newTradeItem.save(function(err) { // Saving the object into database
    if (!err) {
      res.redirect("/");
    } else {
      console.log(err);
    }
  });
});

app.post("/change", async function(req, res) { // Changing the price of the specific item
  const requestedItemID = req.body.specificItem; // Gets the id of corresponding item (via hidden input's value)
  const changedPrice = req.body.newPrice; // Gets the price client has entered

  await updatePrice(requestedItemID, changedPrice, selectedType, res); // Updates the new price
});

app.post("/:selectedType/change", async function(req, res) { // Changing the price of the specific item
  const selectedType = req.params.selectedType; // Whatever is selected
  const requestedItemID = req.body.specificItem; // Gets the id of corresponding item (via hidden input's value)
  const changedPrice = req.body.newPrice; // Gets the price client has entered
  await updatePrice(requestedItemID, changedPrice, selectedType, res); // Updates the new price
});


// Running the server
connectDB().then(function (){
  app.listen(process.env.PORT || 3000, function() {
    console.log("Server is on and ready to wrack baby");
  });
});
