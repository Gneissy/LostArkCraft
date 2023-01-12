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
// mongoose.connect("mongodb://127.0.0.1:27017/lostarkItemDB"); // Connecting Mongo Database, Collection & Mongo Atlas
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
var i = 0;

const requiredTradeItemsQuantity = ["6","24", "48"];
const requiredTradeItemsString = ["Bright Wild Flower", "Shy Wild Flower", "Wild Flower"];


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
  perCraftTimeSecond: Number // 25
});
// Creating the other collection which is BattleItems
const BattleItem = mongoose.model("BattleItem", battleItemSchema); // "battleItems" collection is created



// TradeItem.find({name: "Wild Flower"}, function(err, foundTradeItem){
//   if(!err){
//       requiredTradeItemsQuantity.push("4", "10");
//       requiredTradeItems.push(foundTradeItem);
//       TradeItem.find({name: "Shy Wild Flower"}, function(err, foundTradeItem){
//         if(!err){
//           requiredTradeItems.push(foundTradeItem);
//           BattleItem.findOneAndUpdate({name:"HP Potion"}, {$set:{requirements: requiredTradeItems}}, {new: true}, function(err){
//             console.log("HP Potion's requirements are updated.");
//           });
//           BattleItem.findOneAndUpdate({name:"HP Potion"}, {$set:{requirementQuantities: requiredTradeItemsQuantity}}, {new: true}, function(err){
//             console.log("HP Potion's requirement quantities are updated.");
//           });
//         }else{
//           console.log(err);
//         }
//       }); // WORKS
//   }
// });// i need to update it now.

// In order to update price for both main page and specific type pages
function updatePrice(requestedItemID, changedPrice, selectedType, res){
  TradeItem.findOneAndUpdate( // Updating the object's price property
    {
      _id: requestedItemID // Finds the object,
    }, {
      $set: {
        price: changedPrice // Updates the price.
      }
    },
    function(err, result) {
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


// Creating new Battle Item (temp)
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





// Updating existing battle item's requirements
function updateBattleItem(i, battleItem, requiredTradeItems, requiredTradeItemsQuantity){ // i is how many types of material required
  for(let a=0; a<i; a++){
    TradeItem.find({name: requiredTradeItemsString[a]}, function(err, foundTradeItem){
      requiredTradeItems.push(foundTradeItem);
      BattleItem.findOneAndUpdate({name:battleItem},
        {
          $set:
          {
            requirements: requiredTradeItems,
            requirementQuantities: requiredTradeItemsQuantity
          }
        }, {new: true}, function(err, foundObject){
        console.log(a+1 + " of " + i + " updates for " + foundObject.name + " is successfully completed.");
      });
    });

    }
  }

 // createNewBattleItem("Elemental HP Potion", 3, "Recovery", "epic", 29, 30, 3, 3600);
 // updateBattleItem(3, "Elemental HP Potion", requiredTradeItems, requiredTradeItemsQuantity);




function calculateProfit(battleItem){ // This is ok

  BattleItem.find({name: battleItem}, function(err,foundItem){
    var battleItemSellingPrice = foundItem[0].price; // Battle Item's selling price
    var battleItemPerCraftCost = foundItem[0].perCraftCost; // Batle Item's crafting cost
    var battleItemPerCraftQuantity = foundItem[0].perCraftQuantity; // How many craft is supplied per craft process
    var battleItemMarketFee = Math.ceil(battleItemSellingPrice/20);
    var allTradeItemsCost = 0;

    for(var i=0; i<foundItem[0].requirements.length; i++){

      var tradeItemPrice = foundItem[0].requirements[i][0].price; // Trade Item's bundle price
      var tradeItemBundle = foundItem[0].requirements[i][0].bundle; // Trade Item's bundle quantity (10 or 100)
      var tradeItemRequirementQuantity = parseInt(foundItem[0].requirementQuantities[i]); // How many trade item is required per craft

      var tradeItemCost = (tradeItemPrice*tradeItemRequirementQuantity)/tradeItemBundle;
      allTradeItemsCost += tradeItemCost;
    }

    var allCraftingCost = ((allTradeItemsCost + battleItemPerCraftCost) / battleItemPerCraftQuantity)+battleItemMarketFee;
    var profitRate = (battleItemSellingPrice / allCraftingCost)*100; // the result profit rate as %
    console.log(profitRate);

    // return profitRate;
  });
}


function calculateEfficiency(){
  // Here will be the same calculateProfit() with addition of time parameter
}


function setProfitValue(battleItem, profitRate){
  BattleItem.findOneAndUpdate({name: battleItem}, {$set:{profitRate: profitRate}}, {new: true}, function(err, foundObject){console.log(foundObject+"'s profit rate is updated.");});
}


calculateProfit("Major HP Potion");







// ________________________________________________________________Get requests
app.get("/", function(req, res) { // Home Page as home.ejs
  date1 = dayjs(); // to get exact "now" when client is entered the site
  TradeItem.find({}, function(err, tradeItems) { // Find Horse objects having "" properties (all)
    res.render("home", { // send "home.ejs"
      tradeItemDisplayed: tradeItems, // "tradeItemDisplayed" in home.ejs is "tradeItems" in app.js find function
      date1: date1 // to show relative last update time
    });
  });
});

app.get("/:selectedType", function(req, res) { // Be selected with dropdown menu
  const selectedType = req.params.selectedType; // Whatever is selected
  date1 = dayjs();  // to get exact "now" when client is entered the site
  TradeItem.find({
    type: selectedType // Query by selected type
  }, function(err, tradeItems) {
    res.render("customHome", {
      tradeItemDisplayed: tradeItems, // Display to user whatever selected
      selectedType: selectedType,
      date1: date1 // to show relative last update time
    });
  });
});



// _______________________________________________________________Post Requests
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


app.post("/change", function(req, res) { // Changing the price of the specific item
  const requestedItemID = req.body.specificItem; // Gets the id of corresponding item (via hidden input's value)
  const changedPrice = req.body.newPrice; // Gets the price client has entered
  updatePrice(requestedItemID, changedPrice, selectedType, res);
});

app.post("/:selectedType/change", function(req, res) { // Changing the price of the specific item
  const selectedType = req.params.selectedType; // Whatever is selected
  const requestedItemID = req.body.specificItem; // Gets the id of corresponding item (via hidden input's value)
  const changedPrice = req.body.newPrice; // Gets the price client has entered
  updatePrice(requestedItemID, changedPrice, selectedType, res);
});


// Running the server
app.listen(process.env.PORT || 3000, function() {
  console.log("Server is on and ready to wrack baby");
});
