const mongoose = require("mongoose");
const NotifySchema = mongoose.Schema({
  title: {
    type: String,
    require: true,
  },
  code: {
    type: String,
    require: true,
  },
  createAt: {
    type: String,
    default: new Date().getTime(),
  },
});

module.exports = mongoose.model("Notify", NotifySchema);
