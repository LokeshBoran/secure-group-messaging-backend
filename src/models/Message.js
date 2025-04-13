const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  groupId: { type: Schema.Types.ObjectId, ref: "Group", required: true },
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true }, // Encrypted message content
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Message", MessageSchema);
