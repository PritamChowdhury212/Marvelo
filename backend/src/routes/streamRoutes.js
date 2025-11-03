import express from "express";
import { StreamChat } from "stream-chat";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

const STREAM_API_KEY = process.env.STREAM_API_KEY;
const STREAM_API_SECRET = process.env.STREAM_API_SECRET;

// Server-side Stream client (needs secret)
const serverClient = StreamChat.getInstance(STREAM_API_KEY, STREAM_API_SECRET);

/**
 * POST /api/stream/user
 * Body: { id, name, image }
 * Upserts the user and returns a token
 */
router.post("/user", protectRoute, async (req, res) => {
  try {
    const { id, name, image } = req.body;

    if (!id || !name) {
      return res.status(400).json({ message: "User id and name are required" });
    }

    await serverClient.upsertUsers([
      {
        id: id.toString(),
        name,
        image: image || null,
      },
    ]);

    const token = serverClient.createToken(id.toString());

    res.json({ user: { id, name, image }, token });
  } catch (error) {
    console.error("STREAM USER ERROR:", error);
    res.status(500).json({
      message: "Failed to create Stream user",
      error: error.message,
    });
  }
});

/**
 * POST /api/stream/upsert-members
 * Body: { members: [{id, name, image}] }
 * Upserts all group members including current logged-in user
 */
router.post("/upsert-members", protectRoute, async (req, res) => {
  try {
    const { members } = req.body;

    if (!members || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ message: "Members array is required" });
    }

    // Always include current logged-in user
    const allMembers = [
      ...members.filter((m) => m.id !== req.user._id.toString()),
      {
        id: req.user._id.toString(),
        name: req.user.fullName,
        image: req.user.profilePic || null,
      },
    ];

    // Format members for Stream
    const formattedMembers = allMembers.map((m) => ({
      id: m.id.toString(),
      name: m.name || "Unknown",
      image: m.image || null,
    }));

    await serverClient.upsertUsers(formattedMembers);

    res.json({ success: true, upsertedCount: formattedMembers.length });
  } catch (error) {
    console.error("STREAM UPSERT MEMBERS ERROR:", error);
    res.status(500).json({
      message: "Failed to upsert group members",
      error: error.message,
    });
  }
});

/**
 * POST /api/stream/ensure-pm-channel
 * Body: { recipients: [userIds...] }
 * Creates (or reuses) a private channel between sender and recipients
 */
router.post("/ensure-pm-channel", protectRoute, async (req, res) => {
  try {
    const { recipients } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ message: "Recipients array is required" });
    }

    // include sender
    const allMembers = [
      ...new Set([req.user._id.toString(), ...recipients.map(String)]),
    ];
    const sortedIds = [...allMembers].sort();
    const channelId = `pm_${sortedIds.join("_")}`;

    // ensure all users exist on Stream
    await serverClient.upsertUsers(
      allMembers.map((id) => ({
        id,
      }))
    );

    const channel = serverClient.channel("messaging", channelId, {
      members: sortedIds,
      name: "Private chat",
      private: true,
    });

    try {
      await channel.create();
    } catch (err) {
      if (!err.message.includes("exists")) throw err;
    }

    res.json({ success: true, channelId });
  } catch (error) {
    console.error("ENSURE PM CHANNEL ERROR:", error);
    res.status(500).json({
      message: "Failed to ensure PM channel",
      error: error.message,
    });
  }
});

export default router;
