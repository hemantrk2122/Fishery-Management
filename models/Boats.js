const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const boatSchema = new mongoose.Schema({
  owner_name: {
    type: String,
    require: true
  },
  boat_number: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  date_created: {
    type: Date,
    default: Date.now
  }
});

const boatModel = mongoose.model("Boats", boatSchema);