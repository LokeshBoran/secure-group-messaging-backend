const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  groupId: { type: Schema.Types.ObjectId, ref: "Group", required: true, index: true },
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  content: { type: String, required: true }, // Encrypted message content
  timestamp: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model("Message", MessageSchema);
