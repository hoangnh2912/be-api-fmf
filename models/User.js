const mongoose = require("mongoose");
const UserSchema = mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  phone: {
    type: String,
    require: true,
  },
  deviceId: {
    type: String,
    default: null,
  },
  lastOnline: {
    type: String,
    default: new Date().getTime(),
  },
  code: {
    type: String,
    require: true,
  },
  host_code: {
    type: String,
    default: null,
  },
  status: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("User", UserSchema);
