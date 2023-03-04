const mongoose = require("mongoose");

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

module.exports = connectDB;
