const express = require("express");
const router = express.Router();

// Models
const TradeItem = require("../models/tradeItem.js");
const BattleItem = require("../models/battleItem.js");

// Bring in route control functions
const { getHomePage, getProfitPage, getSelectedTypePage, postNewPrice } = require("../controllers/itemController");

router.get("/", getHomePage);
router.get("/profit", getProfitPage);
router.get("/:selectedType", getSelectedTypePage);
router.post("/:selectedType/change", postNewPrice);

module.exports = router;
