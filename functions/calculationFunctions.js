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


// Main price updating function
const updatePrice = async (requestedItemID, changedPrice, selectedType, res) => {
  var isBattleItem = allBattleItemTypes.includes(selectedType);
  var isTradeItem = allTradeItemTypes.includes(selectedType);

  if (isBattleItem) { // If its a type of Battle item,
    BattleItem.findOneAndUpdate( // Updating the object's price property
      {
        _id: requestedItemID // Finds the object,
      }, {
        $set: {
          price: changedPrice // Updates the price.
        }
      },
      async function(err, result) { // i couldn't make async await here, it just doesnt work properly for some reason
        if (!err) {
          console.log("---");
          console.log(result.name + "'s price is changed to " + changedPrice);
          var lastUpdate = dayjs();
          BattleItem.findOneAndUpdate({
            _id: requestedItemID
          }, {
            $set: {
              lastUpdate: lastUpdate // setting the last update time
            }
          }, {
            new: true
          }, async function(err) {
            if (!err) {
              console.log("Last update date for " + result.name + " is up to date now.");
              console.log("---");
              // Calculate and set values of related battle items' profit rate after battle item's price change
              await calculateProfit(result.name);
            } else {
              console.log(err);
            }
          });
          // console.log(lastUpdate); // just to control what we got
          res.redirect("/" + selectedType);
        } else {
          console.log(err);
        }
      });
  } else if (isTradeItem) { // If its a type of Trade item,
    TradeItem.findOneAndUpdate( // Updating the object's price property
      {
        _id: requestedItemID // Finds the object,
      }, {
        $set: {
          price: changedPrice // Updates the price.
        }
      },
      async function(err, result) { // i couldn't make async await here, it just doesnt work properly for some reason
        if (!err) {
          console.log("---");
          console.log(result.name + "'s price is changed to " + changedPrice);
          var lastUpdate = dayjs();
          TradeItem.findOneAndUpdate({
            _id: requestedItemID
          }, {
            $set: {
              lastUpdate: lastUpdate // setting the last update time
            }
          }, {
            new: true
          }, async function(err) {
            if (!err) {
              console.log("Last update date for " + result.name + " is up to date now.");
              console.log("---");
              // Calculate and set values of related battle items' profit rate after its required trade item's price
              await calculateProfitAfterChangingPrice(result.name);
            } else {
              console.log(err);
            }
          });
          // console.log(lastUpdate); // just to control what we got
          res.redirect("/" + selectedType);
        } else {
          console.log(err);
        }
      });
  }
}


// Profit calculation function
async function calculateProfit(battleItem) { // This works properly, calculates the corresponding battle item's profit rate
  BattleItem.find({
    name: battleItem
  }, async function(err, foundItem) {

    var battleItemSellingPrice = foundItem[0].price; // Battle Item's selling price
    var battleItemPerCraftCost = foundItem[0].perCraftCost; // Batle Item's crafting cost
    var battleItemPerCraftQuantity = foundItem[0].perCraftQuantity; // How many craft is supplied per craft process
    var battleItemMarketFee = Math.ceil(battleItemSellingPrice / 20); // Fee price per Battle Item
    var allTradeItemsCost = 0;
    // Only first and second calculateProfitForIndex constants will be commented
    // The reason im doing it one by one is that i can't use "for" loop properly in this Mongoose situation.
    const calculateProfitForIndex0 = async function() {
      await setTimeout(async function() {
        if (foundItem[0].requirements.length > 0) { // If requirement quantity is bigger than 0,
          TradeItem.find({
            name: foundItem[0].requirements[0]
          }, async function(err, foundTradeItem) { // Find corresponding trade item
            var tradeItemPrice = foundTradeItem[0].price; // Trade Item's bundle price
            var tradeItemBundle = foundTradeItem[0].bundle; // Trade Item's bundle quantity (10 or 100)
            var tradeItemRequirementQuantity = foundItem[0].requirementQuantities[0]; // How many of them we need (index 0 of requirementQuantities)

            var tradeItemCost = (tradeItemPrice / tradeItemBundle) * tradeItemRequirementQuantity; // Calculation method of the cost of a trade item
            allTradeItemsCost += tradeItemCost; // Adding the sum of all trade items
            // console.log(allTradeItemsCost); // Control purposes

            if (foundItem[0].requirements.length == 1) { // This finishes the loop, calculates profit rate and updates if there is only 1 requirement:
              var allCraftingCost = ((allTradeItemsCost + battleItemPerCraftCost) / battleItemPerCraftQuantity) + battleItemMarketFee; // Calculation method of all crafting cost
              var profitRate = (battleItemSellingPrice / allCraftingCost) * 100; // Calculation method of profit rate
              // Updating battle item's profit rate:
              BattleItem.findOneAndUpdate({
                name: battleItem
              }, {
                $set: {
                  profitRate: profitRate
                }
              }, {
                new: true
              }, function(err, foundObject) {
                console.log(foundObject.name + "'s profit rate is updated as " + profitRate);
              });
            }
          });
        }
      }, 400);
    }

    const calculateProfitForIndex1 = async function() {
      await setTimeout(async function() {
        if (foundItem[0].requirements.length > 1) { // If requirement quantity is bigger than 1,
          TradeItem.find({
            name: foundItem[0].requirements[1]
          }, async function(err, foundTradeItem) {
            var tradeItemPrice = foundTradeItem[0].price;
            var tradeItemBundle = foundTradeItem[0].bundle;
            var tradeItemRequirementQuantity = foundItem[0].requirementQuantities[1]; // How many of them we need (index 1 of requirementQuantities)

            var tradeItemCost = (tradeItemPrice / tradeItemBundle) * tradeItemRequirementQuantity;
            allTradeItemsCost += tradeItemCost;
            // console.log(allTradeItemsCost);
            if (foundItem[0].requirements.length == 2) { // This finishes the loop, calculates profit rate and updates if there is 2 requirement:
              var allCraftingCost = ((allTradeItemsCost + battleItemPerCraftCost) / battleItemPerCraftQuantity) + battleItemMarketFee;
              var profitRate = (battleItemSellingPrice / allCraftingCost) * 100;
              BattleItem.findOneAndUpdate({
                name: battleItem
              }, {
                $set: {
                  profitRate: profitRate
                }
              }, {
                new: true
              }, function(err, foundObject) {
                console.log(foundObject.name + "'s profit rate is updated as " + profitRate);
              });
            }
          });
        }
      }, 800);
    }

    const calculateProfitForIndex2 = async function() {
      await setTimeout(async function() {
        if (foundItem[0].requirements.length > 2) {
          TradeItem.find({
            name: foundItem[0].requirements[2]
          }, async function(err, foundTradeItem) {
            var tradeItemPrice = foundTradeItem[0].price;
            var tradeItemBundle = foundTradeItem[0].bundle;
            var tradeItemRequirementQuantity = foundItem[0].requirementQuantities[2];

            var tradeItemCost = (tradeItemPrice / tradeItemBundle) * tradeItemRequirementQuantity;
            allTradeItemsCost += tradeItemCost;
            // console.log(allTradeItemsCost);
            if (foundItem[0].requirements.length == 3) {
              var allCraftingCost = ((allTradeItemsCost + battleItemPerCraftCost) / battleItemPerCraftQuantity) + battleItemMarketFee;
              var profitRate = (battleItemSellingPrice / allCraftingCost) * 100;
              BattleItem.findOneAndUpdate({
                name: battleItem
              }, {
                $set: {
                  profitRate: profitRate
                }
              }, {
                new: true
              }, function(err, foundObject) {
                console.log(foundObject.name + "'s profit rate is updated as " + profitRate);
              });
            }
          });
        }
      }, 1200);
    }

    const calculateProfitForIndex3 = async function() {
      await setTimeout(async function() {
        if (foundItem[0].requirements.length > 3) {
          TradeItem.find({
            name: foundItem[0].requirements[3]
          }, async function(err, foundTradeItem) {
            var tradeItemPrice = foundTradeItem[0].price;
            var tradeItemBundle = foundTradeItem[0].bundle;
            var tradeItemRequirementQuantity = foundItem[0].requirementQuantities[3];

            var tradeItemCost = (tradeItemPrice / tradeItemBundle) * tradeItemRequirementQuantity;
            allTradeItemsCost += tradeItemCost;
            // console.log(allTradeItemsCost);
            if (foundItem[0].requirements.length == 4) {
              var allCraftingCost = ((allTradeItemsCost + battleItemPerCraftCost) / battleItemPerCraftQuantity) + battleItemMarketFee;
              var profitRate = (battleItemSellingPrice / allCraftingCost) * 100;
              BattleItem.findOneAndUpdate({
                name: battleItem
              }, {
                $set: {
                  profitRate: profitRate
                }
              }, {
                new: true
              }, function(err, foundObject) {
                console.log(foundObject.name + "'s profit rate is updated as " + profitRate);
              });
            }
          });
        }
      }, 1600);
    }

    const calculateProfitForIndex4 = async function() {
      await setTimeout(async function() {
        if (foundItem[0].requirements.length > 4) {
          TradeItem.find({
            name: foundItem[0].requirements[4]
          }, async function(err, foundTradeItem) {
            var tradeItemPrice = foundTradeItem[0].price;
            var tradeItemBundle = foundTradeItem[0].bundle;
            var tradeItemRequirementQuantity = foundItem[0].requirementQuantities[4];

            var tradeItemCost = (tradeItemPrice / tradeItemBundle) * tradeItemRequirementQuantity;
            allTradeItemsCost += tradeItemCost;
            // console.log(allTradeItemsCost);
            if (foundItem[0].requirements.length == 5) {
              var allCraftingCost = ((allTradeItemsCost + battleItemPerCraftCost) / battleItemPerCraftQuantity) + battleItemMarketFee;
              var profitRate = (battleItemSellingPrice / allCraftingCost) * 100;
              BattleItem.findOneAndUpdate({
                name: battleItem
              }, {
                $set: {
                  profitRate: profitRate
                }
              }, {
                new: true
              }, function(err, foundObject) {
                console.log(foundObject.name + "'s profit rate is updated as " + profitRate);
              });
            }
          });
        }
      }, 2000);
    }

    const calculateProfitForIndex5 = async function() {
      await setTimeout(async function() {
        if (foundItem[0].requirements.length > 5) {
          TradeItem.find({
            name: foundItem[0].requirements[5]
          }, async function(err, foundTradeItem) {
            var tradeItemPrice = foundTradeItem[0].price;
            var tradeItemBundle = foundTradeItem[0].bundle;
            var tradeItemRequirementQuantity = foundItem[0].requirementQuantities[5];

            var tradeItemCost = (tradeItemPrice / tradeItemBundle) * tradeItemRequirementQuantity;
            allTradeItemsCost += tradeItemCost;
            // console.log(allTradeItemsCost);
            if (foundItem[0].requirements.length == 6) {
              var allCraftingCost = ((allTradeItemsCost + battleItemPerCraftCost) / battleItemPerCraftQuantity) + battleItemMarketFee;
              var profitRate = (battleItemSellingPrice / allCraftingCost) * 100;
              BattleItem.findOneAndUpdate({
                name: battleItem
              }, {
                $set: {
                  profitRate: profitRate
                }
              }, {
                new: true
              }, function(err, foundObject) {
                console.log(foundObject.name + "'s profit rate is updated as " + profitRate);
              });
            }
          });
        }
      }, 2400);
    }

    // This function lets me async execution of calculation method
    async function calculateOverallProfit() {
      await calculateProfitForIndex0()
        .then(calculateProfitForIndex1)
        .then(calculateProfitForIndex2)
        .then(calculateProfitForIndex3)
        .then(calculateProfitForIndex4)
        .then(calculateProfitForIndex5);
    }

    await calculateOverallProfit();
  });
}



// Profit calculation function to be called after changing price
async function calculateProfitAfterChangingPrice(foundTradeItem) { // foundTradeItem is basically the trade item whose price is changed.
  BattleItem.find({
    requirements: foundTradeItem
  }, async function(err, foundItem) { // Find all battle items related to the trade item whose price is changed
    for (var i = 0; i < foundItem.length; i++) { // No need to be async
      await calculateProfit(foundItem[i].name);
    }
  });
}


// Function to be updated calculated profit value
async function setProfitValue(battleItem, profitRate) {
  await BattleItem.findOneAndUpdate({
    name: battleItem
  }, {
    $set: {
      profitRate: profitRate
    }
  }, {
    new: true
  }, function(err, foundObject) {
    console.log(foundObject + "'s profit rate is updated.");
  });
}



// This function is for future use
function calculateEfficiency() {
  // Here will be the same calculateProfit() with addition of time parameter
}


module.exports = updatePrice;
