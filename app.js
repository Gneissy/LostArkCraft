require('dotenv').config()
const express = require("express"); // Express is required
const app = express(); // I'll use "app" for accesing express
const https = require("https"); // https is required for get request
app.use(express.urlencoded({
  extended: true
})); // Body-parser
app.use(express.static("public")); // Static method in order to access local files like css and images
app.set("view engine", "ejs"); // EJS is set
var _ = require('lodash'); // Lodash is required
const mongoose = require("mongoose"); // Mongoose is required
// mongoose.connect("mongodb://127.0.0.1:27017/lostarkItemDB"); // Connecting Mongo Database, Collection & Mongo Atlas
mongoose.connect(process.env.MONGOSERVER); // Connecting Mongo Database, Collection & Mongo Atlas


const changedPrice = "at";
// Creating a DB Schema
const tradeItemSchema = new mongoose.Schema({ // This allows us to record posts in database
  name: String,
  customID: Number,
  type: String,
  rarity: String,
  bundle: Number,
  price: Number,
});
// Creating the Collection
const TradeItem = mongoose.model("TradeItem", tradeItemSchema); // "tradeItems" collection is created.
const newTradeItem = new TradeItem({ // This is an example object
  name: "Bright Wild Flower",
  customID: 2,
  type: "foraging",
  rarity: "rare",
  bundle: 10,
  price: 4,
});
// Then you need to save this newHorse into database:
// newTradeItem.save();


// Creating another DB Schema
const battleItemSchema = new mongoose.Schema({

});




// ________________________________________________________________Get requests
app.get("/", function(req, res) { // Home Page as home.ejs
  TradeItem.find({}, function(err, tradeItems) { // Find Horse objects having "" properties (all)
    res.render("home", { // send "home.ejs"
      tradeItemDisplayed: tradeItems // "tradeItemDisplayed" in home.ejs is "tradeItems" in app.js find function
    });
  });
});

app.get("/:selectedType", function(req, res) { // Be selected with dropdown menu
  const selectedType = req.params.selectedType; // Whatever is selected
  TradeItem.find({
    type: selectedType // Query by selected type
  }, function(err, tradeItems) {
    res.render("customHome", {
      tradeItemDisplayed: tradeItems, // Display to user whatever selected
      selectedType: selectedType,
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
  TradeItem.findOneAndUpdate( // Updating the object's price property
    {
      _id: requestedItemID // Finds the object,
    }, {
      $set: {
        price: changedPrice // Updates the price.
      }
    },
    function(err) {
      if (!err) {
        console.log("The item's price is changed successfully.");
        res.redirect("/");
      } else {
        console.log(err);
      }
    });
});

app.post("/:selectedType/change", function(req, res) { // Changing the price of the specific item
  const selectedType = req.params.selectedType; // Whatever is selected
  const requestedItemID = req.body.specificItem; // Gets the id of corresponding item (via hidden input's value)
  const changedPrice = req.body.newPrice; // Gets the price client has entered

  TradeItem.findOneAndUpdate( // Updating the object's price property
    {
      _id: requestedItemID // Finds the object,
    }, {
      $set: {
        price: changedPrice // Updates the price.
      }
    },
    function(err) {
      if (!err) {
        console.log("The item's price is changed successfully in selected Type.");
        res.redirect("/" + selectedType);
      } else {
        console.log(err);
      }
    });
});


app.post("/:selectedType/changeAll", function(req, res) {
  const selectedType = req.params.selectedType; // Whatever is selected
  console.log("Submit button is pressed.");

  TradeItem.find({
    type: selectedType // Query by selected type
  }, function(err, tradeItems) {
    tradeItems.forEach(function(object) {
      const requestedItemID = object._id; // Gets the id of corresponding item (via hidden input's value)
      const changedPrice = req.body.newPrice;
      // Note to myself why it doesnt work: Aynı formda değil bu newPrice. Belki de hemen yanına başka bir form
      // oluşturarak bilgileri oradan almalıyım.

      TradeItem.findOneAndUpdate( // Updating the object's price property
        {
          _id: object._id // Finds the object,
        }, {
          $set: {
            price: changedPrice // Updates the price.
          }
        },
        function(err) {
          if (!err) {
            console.log("The item's price is changed successfully by using Submit All button.");
            console.log(requestedItemID);
            console.log(changedPrice); // can't fetch this one
          } else {
            console.log(err);
          }
        });
    });
  });
  res.redirect("/" + selectedType);
});



// Running the server
app.listen(process.env.PORT || 3000, function() {
  console.log("Server is on and ready to wrack baby");
});
