const mongoose = require("mongoose");

const requiredTradeItems = [];
const requiredTradeItemsString = [];
const requiredTradeItemsQuantity = [];

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

module.exports = BattleItem;
