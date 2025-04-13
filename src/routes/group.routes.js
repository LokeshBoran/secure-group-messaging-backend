const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const {
  createGroup,
  joinGroup,
  approveJoinRequest,
  leaveGroup,
  banishMember,
  transferOwnership,
  deleteGroup
} = require("../controllers/group.controller");

// All endpoints below require authentication
router.post("/", authMiddleware, createGroup);
router.post("/:groupId/join", authMiddleware, joinGroup);
router.post("/:groupId/approve", authMiddleware, approveJoinRequest);
router.post("/:groupId/leave", authMiddleware, leaveGroup);
router.post("/:groupId/banish", authMiddleware, banishMember);
router.post("/:groupId/transfer", authMiddleware, transferOwnership);
router.delete("/:groupId", authMiddleware, deleteGroup);

module.exports = router;
