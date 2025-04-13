const Group = require("../models/Group");
const User = require("../models/User");

/**
 * Create a new group with the given name, type, and maximum number of members.
 * The authenticated user is set as the group owner and the first member of the group.
 * @param {object} req - The request object.
 * @param {string} req.body.name - The name of the group.
 * @param {string} req.body.type - The type of the group; either 'open' or 'private'.
 * @param {number} req.body.maxMembers - The maximum number of members the group can have.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function in the stack.
 */
exports.createGroup = async (req, res, next) => {
  try {
    const { name, type, maxMembers } = req.body;
    if (!name || !type || !maxMembers) {
      return res.status(400).json({ message: "Group name, type, and maxMembers are required." });
    }
    if (!["open", "private"].includes(type)) {
      return res.status(400).json({ message: "Group type must be either 'open' or 'private'." });
    }
    // Create group with owner as the authenticated user
    const group = new Group({
      name,
      type,
      maxMembers,
      owner: req.user._id,
      members: [req.user._id]
    });
    await group.save();
    res.status(201).json({ message: "Group created successfully.", group });
  } catch (err) {
    next(err);
  }
};

/**
 * Join group endpoint
 * Allows a user to join an open group immediately or submit a join request for a private group.
 * Checks for ban status, group capacity, and cooldown period for rejoining private groups.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function in the stack.
 */
exports.joinGroup = async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    // Check if the user is banned from the group
    if (group.bannedMembers.includes(req.user._id)) {
      return res.status(403).json({ message: "You are banned from this group. Submit a new join request for approval." });
    }

    if (group.type === "open") {
      // Open group: add member immediately if not already a member and capacity allows
      if (group.members.includes(req.user._id)) {
        return res.status(400).json({ message: "Already a member of this group." });
      }
      if (group.members.length >= group.maxMembers) {
        return res.status(400).json({ message: "Group has reached maximum capacity." });
      }
      group.members.push(req.user._id);
      await group.save();
      return res.json({ message: "Joined open group successfully." });
    }

    if (group.type === "private") {
      // Private group: enforce cooldown period before rejoining
      const leaveRecord = group.privateLeaveLog.find(record => record.userId.equals(req.user._id));
      if (leaveRecord) {
        const now = new Date();
        const elapsedMs = now - leaveRecord.leftAt;
        const cooldownMs = 48 * 60 * 60 * 1000; // 48 hours in milliseconds
        if (elapsedMs < cooldownMs) {
          return res.status(403).json({ message: "You left this group recently. Please wait 48 hours before rejoining." });
        }
        // Remove the leave record if cooldown has expired
        group.privateLeaveLog = group.privateLeaveLog.filter(record => !record.userId.equals(req.user._id));
      }
      // Check if a join request has already been submitted
      const alreadyRequested = group.joinRequests.some(jr => jr.userId.equals(req.user._id));
      if (alreadyRequested) {
        return res.status(400).json({ message: "Join request already submitted." });
      }
      // Add a new join request
      group.joinRequests.push({ userId: req.user._id });
      await group.save();
      return res.json({ message: "Join request submitted. Await approval from the group owner." });
    }
  } catch (err) {
    next(err);
  }
};


/**
 * Approve a join request for a group.
 * Only the group owner is authorized to approve join requests.
 * @param {Object} req - The request object.
 * @param {string} req.params.groupId - The ID of the group.
 * @param {string} req.body.userId - The ID of the user whose join request is being approved.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the stack.
 */
exports.approveJoinRequest = async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    const { userId } = req.body; // ID of the user whose request is being approved

    // Retrieve the group by ID
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    // Check if the requester is the group owner
    if (!group.owner.equals(req.user._id)) {
      return res.status(403).json({ message: "Only the group owner can approve join requests." });
    }

    // Find the join request index for the specified userId
    const requestIndex = group.joinRequests.findIndex(req => req.userId.equals(userId));
    if (requestIndex === -1) {
      return res.status(404).json({ message: "Join request not found." });
    }

    // Ensure the group has not reached its maximum membership capacity
    if (group.members.length >= group.maxMembers) {
      return res.status(400).json({ message: "Group has reached maximum capacity." });
    }

    // Approve the join request: add the user to members and remove the request
    group.members.push(userId);
    group.joinRequests.splice(requestIndex, 1);
    await group.save();

    // Respond with success message
    res.json({ message: "User added to group." });
  } catch (err) {
    next(err);
  }
};

// Leave group endpoint
/**
 * Endpoint for a user to leave a group.
 * 
 * NOTE: The group owner cannot leave without transferring ownership.
 * @param {Object} req - The request object.
 * @param {string} req.params.groupId - The ID of the group.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the stack.
 */
exports.leaveGroup = async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found." });
    
    // Owner cannot leave without transferring ownership
    if (group.owner.equals(req.user._id)) {
      return res.status(400).json({ message: "Owner must transfer ownership before leaving the group." });
    }
    
    // Remove user from members list
    group.members = group.members.filter(memberId => !memberId.equals(req.user._id));
    
    // For private groups, record the leave timestamp to enforce cooldown
    if (group.type === "private") {
      group.privateLeaveLog.push({ userId: req.user._id, leftAt: new Date() });
    }
    
    await group.save();
    res.json({ message: "Left group successfully." });
  } catch (err) {
    next(err);
  }
};


/**
 * Banish a member from the group.
 * Only the group owner is authorized to banish a member.
 * @param {Object} req - The request object.
 * @param {string} req.params.groupId - The ID of the group.
 * @param {string} req.body.userId - The ID of the user to be banished.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the stack.
 */
exports.banishMember = async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    const { userId } = req.body;

    // Retrieve the group by ID
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    // Check if the requester is the group owner
    if (!group.owner.equals(req.user._id)) {
      return res.status(403).json({ message: "Only the group owner can banish members." });
    }

    // Remove the user from members if present, and add to bannedMembers
    group.members = group.members.filter(memberId => !memberId.equals(userId));
    group.bannedMembers.push(userId);

    // Save the updated group document
    await group.save();

    // Respond with success message
    res.json({ message: "User banished from group." });
  } catch (err) {
    // Pass any errors to the error handling middleware
    next(err);
  }
};

// Transfer group ownership endpoint (owner transfers to another member)
// The owner is the only user authorized to transfer ownership
// The new owner must be a current member of the group
exports.transferOwnership = async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    const { newOwnerId } = req.body;
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }
    // Verify the requester is the group owner
    if (!group.owner.equals(req.user._id)) {
      return res.status(403).json({ message: "Only the group owner can transfer ownership." });
    }
    // Ensure the new owner is a member of the group
    if (!group.members.includes(newOwnerId)) {
      return res.status(400).json({ message: "New owner must be a current member of the group." });
    }
    // Update the group document with the new owner
    group.owner = newOwnerId;
    await group.save();
    // Respond with success message
    res.json({ message: "Ownership transferred successfully." });
  } catch (err) {
    // Pass any errors to the error handling middleware
    next(err);
  }
};

/**
 * Delete group endpoint.
 * Allows the group owner to delete the group if they are the sole remaining member.
 * 
 * @param {Object} req - The request object.
 * @param {string} req.params.groupId - The ID of the group to be deleted.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the stack.
 */
exports.deleteGroup = async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    
    // Retrieve the group by ID
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    // Check if the requester is the group owner
    if (!group.owner.equals(req.user._id)) {
      return res.status(403).json({ message: "Only the group owner can delete the group." });
    }

    // Ensure the owner is the only remaining member of the group
    if (group.members.length > 1) {
      return res.status(400).json({ message: "Group cannot be deleted unless owner is the sole member." });
    }

    // Remove the group
    await group.remove();
    res.json({ message: "Group deleted successfully." });
  } catch (err) {
    // Pass any errors to the error handling middleware
    next(err);
  }
};
