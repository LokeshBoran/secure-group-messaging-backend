const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "Please use a valid email address."]
  },
  password: {
    type: String,
    required: true
  },
  createdAt: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model("User", UserSchema);
