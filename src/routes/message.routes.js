const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const { sendMessage, getMessages } = require("../controllers/message.controller");

router.post("/:groupId", authMiddleware, sendMessage);
router.get("/:groupId", authMiddleware, getMessages);

module.exports = router;
