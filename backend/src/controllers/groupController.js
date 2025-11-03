import Group from "../models/Group.js";
import { StreamChat } from "stream-chat";

// Load Stream credentials
const STREAM_API_KEY = process.env.STREAM_API_KEY;
const STREAM_API_SECRET = process.env.STREAM_API_SECRET;

// Server-side Stream client
const serverClient = StreamChat.getInstance(STREAM_API_KEY, STREAM_API_SECRET);

// CREATE GROUP + Stream channel
export const createGroup = async (req, res) => {
  try {
    const { name, image } = req.body;
    const userId = req.user._id;

    if (!name) {
      return res.status(400).json({ message: "Group name is required" });
    }

    const group = new Group({
      name,
      image,
      createdBy: userId,
      members: [userId],
    });
    await group.save();

    const channel = serverClient.channel("messaging", group._id.toString(), {
      name,
      members: [userId.toString()],
      created_by_id: userId.toString(),
      image,
    });
    await channel.create();

    res.status(201).json(group);
  } catch (error) {
    console.error("CREATE GROUP ERROR:", error);
    res.status(500).json({ message: "Failed to create group" });
  }
};

// JOIN GROUP + add to Stream channel
export const joinGroup = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user._id;

    const group = await Group.findOne({ code });
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.members.includes(userId)) {
      return res.status(400).json({ message: "Already a member" });
    }

    group.members.push(userId);
    await group.save();

    const channel = serverClient.channel("messaging", group._id.toString());
    await channel.addMembers([userId.toString()]);

    res.json({ message: "Joined group successfully", group });
  } catch (error) {
    console.error("JOIN GROUP ERROR:", error);
    res.status(500).json({ message: "Failed to join group" });
  }
};

// GET ALL GROUPS WHERE USER IS A MEMBER
export const getMyGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    const groups = await Group.find({ members: userId });
    res.json(groups);
  } catch (error) {
    console.error("GET MY GROUPS ERROR:", error);
    res.status(500).json({ message: "Failed to get groups" });
  }
};

// GET GROUP DETAILS
export const getGroupDetails = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const group = await Group.findById(groupId)
      // FIX: populate fullName and profilePic along with username
      .populate("members", "fullName username profilePic email")
      .populate("createdBy", "fullName username profilePic email");

    if (!group) return res.status(404).json({ message: "Group not found" });

    res.json(group);
  } catch (error) {
    console.error("GET GROUP DETAILS ERROR:", error);
    res.status(500).json({ message: "Failed to get group details" });
  }
};

// LEAVE GROUP + remove from Stream channel
export const leaveGroup = async (req, res) => {
  try {
    const userId = req.user._id;
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    // Remove user from members array
    group.members = group.members.filter(
      (memberId) => memberId.toString() !== userId.toString()
    );
    await group.save();

    // Remove user from Stream channel
    const channel = serverClient.channel("messaging", groupId.toString());
    await channel.removeMembers([userId.toString()]);

    res.json({ message: "Left group successfully" });
  } catch (error) {
    console.error("LEAVE GROUP ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};
