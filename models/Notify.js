const mongoose = require("mongoose");
const NotifySchema = mongoose.Schema({
  headings: {
    type: String,
    require: true,
  },
  contents: {
    type: String,
    require: true,
  },
  code: {
    type: String,
    require: true,
  },
  type: {
    type: Number,
    require: true,
  },
  createAt: {
    type: String,
    default: new Date().getTime(),
  },
});

module.exports = mongoose.model("Notify", NotifySchema);
