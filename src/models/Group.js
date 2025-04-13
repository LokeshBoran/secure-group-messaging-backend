const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const JoinRequestSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  requestedAt: { type: Date, default: Date.now }
});

const PrivateLeaveLogSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  leftAt: { type: Date, default: Date.now }
});

const GroupSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["open", "private"], required: true },
  maxMembers: { type: Number, min: 2, required: true },
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: Schema.Types.ObjectId, ref: "User" }],
  joinRequests: [JoinRequestSchema],
  bannedMembers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  privateLeaveLog: [PrivateLeaveLogSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Group", GroupSchema);
