const Message = require("../models/Message");
const Group = require("../models/Group");
const { encryptMessage, decryptMessage } = require("../utils/cryptoUtil");

/**
 * Send a message to a group endpoint.
 * Encrypts the message content before storing and emits to group members.
 * 
 * @param {Object} req - The request object
 * @param {string} req.params.groupId - The ID of the group
 * @param {string} req.body.content - The message content
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 */
exports.sendMessage = async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    const { content } = req.body;

    // Validate message content
    if (!content) return res.status(400).json({ message: "Message content is required." });

    // Verify the user is a member of the group
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found." });
    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ message: "You are not a member of this group." });
    }

    // Encrypt the message content using AES-128
    const encryptedContent = encryptMessage(content);

    // Create a new message document
    const message = new Message({
      groupId,
      sender: req.user._id,
      content: encryptedContent
    });
    await message.save();

    // Decrypt content for the emitted payload
    const decryptedContent = decryptMessage(message.content);

    // Emit the message to all clients in the group room via Socket.io
    const io = req.app.get("io");
    io.to(groupId).emit("newMessage", {
      _id: message._id,
      sender: message.sender,
      content: decryptedContent,
      timestamp: message.timestamp
    });

    // Respond with a simulated acknowledgment and message details
    res.status(201).json({
      message: "Message sent successfully.",
      ack: { deliveredAt: new Date().toISOString() },
      messageData: {
        _id: message._id,
        sender: message.sender,
        content: decryptedContent,
        timestamp: message.timestamp
      }
    });
  } catch (err) {
    // Pass any errors to the error handling middleware
    next(err);
  }
};

/**
 * Retrieve messages for a group endpoint.
 * Decrypts and returns all messages for a specified group.
 * 
 * @param {Object} req - The request object
 * @param {string} req.params.groupId - The ID of the group
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 */
exports.getMessages = async (req, res, next) => {
  try {
    const groupId = req.params.groupId;

    // Retrieve the group by ID
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found." });

    // Check if the user is authorized to view the messages
    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ message: "You are not authorized to view these messages." });
    }

    // Fetch all messages for the group, sorted by timestamp
    const messages = await Message.find({ groupId }).sort({ timestamp: 1 });

    // Decrypt each message before sending response
    const decryptedMessages = messages.map(msg => ({
      _id: msg._id,
      sender: msg.sender,
      content: decryptMessage(msg.content),
      timestamp: msg.timestamp
    }));

    // Send the decrypted messages in the response
    res.json({ messages: decryptedMessages });
  } catch (err) {
    // Pass any errors to the error handling middleware
    next(err);
  }
};
