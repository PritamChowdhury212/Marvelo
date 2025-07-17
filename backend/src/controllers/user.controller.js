import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";
import Friend from "../models/friend.js";

// Get Recommended Users
export async function getRecommendedUsers(req, res) {
  try {
    const currentUserId = req.user.id;

    const friendships = await Friend.find({
      $or: [{ user1: currentUserId }, { user2: currentUserId }],
    });

    const friendIds = friendships.map((f) =>
      f.user1.toString() === currentUserId
        ? f.user2.toString()
        : f.user1.toString()
    );

    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUserId } },
        { _id: { $nin: friendIds } },
        { isOnboarded: true },
      ],
    });

    res.status(200).json({ success: true, users: recommendedUsers });
  } catch (error) {
    console.error("Error in getRecommendedUsers controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Get Logged in User's Friends
export async function getMyFriends(req, res) {
  try {
    const userId = req.user.id;

    const friendships = await Friend.find({
      $or: [{ user1: userId }, { user2: userId }],
    }).populate([
      { path: "user1", select: "fullName profilePic bio" },
      { path: "user2", select: "fullName profilePic bio" },
    ]);

    const friends = friendships.map((friendship) => {
      if (friendship.user1._id.toString() === userId) {
        return friendship.user2;
      } else {
        return friendship.user1;
      }
    });

    res.status(200).json(friends);
  } catch (error) {
    console.error("Error in getMyFriends controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Send Friend Request
export async function sendFriendRequest(req, res) {
  try {
    const myId = req.user.id;
    const { id: recipientId } = req.params;

    if (myId === recipientId) {
      return res
        .status(400)
        .json({ message: "You can't send friend request to yourself" });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    const existingFriendship = await Friend.findOne({
      $or: [
        { user1: myId, user2: recipientId },
        { user1: recipientId, user2: myId },
      ],
    });

    if (existingFriendship) {
      return res
        .status(400)
        .json({ message: "You are already friends with this user" });
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recipientId },
        { sender: recipientId, recipient: myId },
      ],
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "A friend request already exists between you and this user",
      });
    }

    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient: recipientId,
    });

    res.status(201).json(friendRequest);
  } catch (error) {
    console.error("Error in sendFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Accept Friend Request
export async function acceptFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;
    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (friendRequest.recipient.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to accept this request" });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    await Friend.create({
      user1: friendRequest.sender,
      user2: friendRequest.recipient,
    });

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.log("Error in acceptFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Decline Friend Request
export async function declineFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;
    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (friendRequest.recipient.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to decline this request" });
    }

    friendRequest.status = "declined";
    await friendRequest.save();

    res.status(200).json({ message: "Friend request declined" });
  } catch (error) {
    console.error("Error in declineFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Cancel Outgoing Friend Request
export async function cancelFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;
    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (friendRequest.sender.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to cancel this request" });
    }

    if (friendRequest.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Cannot cancel a request that is not pending" });
    }

    await friendRequest.deleteOne();

    res.status(200).json({ message: "Friend request canceled" });
  } catch (error) {
    console.error("Error in cancelFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Unfriend User
export async function unfriendUser(req, res) {
  try {
    const userId = req.user.id;
    const { friendId } = req.params;

    // Normalize user order
    const [user1, user2] =
      userId < friendId ? [userId, friendId] : [friendId, userId];

    // Delete friendship record
    const deletedFriend = await Friend.findOneAndDelete({ user1, user2 });

    if (!deletedFriend) {
      return res.status(404).json({ message: "Friendship not found" });
    }

    // Removes all friend requests between these two users
    await FriendRequest.deleteMany({
      $or: [
        { sender: userId, recipient: friendId },
        { sender: friendId, recipient: userId },
      ],
    });

    res.status(200).json({
      message: "Unfriended successfully and cleaned up friend requests",
    });
  } catch (error) {
    console.error("Error in unfriendUser controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Get Incoming + Accepted Friend Requests
export async function getFriendRequests(req, res) {
  try {
    const incomingReqs = await FriendRequest.find({
      recipient: req.user.id,
      status: "pending",
    }).populate("sender", "fullName profilePic bio");

    const acceptedReqs = await FriendRequest.find({
      sender: req.user.id,
      status: "accepted",
    }).populate("recipient", "fullName profilePic bio");

    res.status(200).json({ incomingReqs, acceptedReqs });
  } catch (error) {
    console.error(
      "Error in getPendingFriendRequests controller",
      error.message
    );
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Get Outgoing Friend Requests
export async function getOutgoingFriendReqs(req, res) {
  try {
    const outgoingRequests = await FriendRequest.find({
      sender: req.user.id,
      status: "pending",
    }).populate("recipient", "fullName profilePic bio");

    res.status(200).json(outgoingRequests);
  } catch (error) {
    console.error("Error in getOutgoingFriendReqs controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
