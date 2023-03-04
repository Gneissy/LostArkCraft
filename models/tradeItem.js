const mongoose = require("mongoose");

// TradeItem Schema
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

module.exports = TradeItem;
