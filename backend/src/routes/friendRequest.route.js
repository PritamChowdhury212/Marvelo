import express from "express";
import {
  getRecommendedUsers,
  getMyFriends,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
  unfriendUser,
  getFriendRequests,
  getOutgoingFriendReqs,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/recommended", getRecommendedUsers);
router.get("/my-friends", getMyFriends);
router.post("/send/:id", sendFriendRequest);
router.post("/accept/:id", acceptFriendRequest);
router.post("/decline/:id", declineFriendRequest);
router.delete("/cancel/:id", cancelFriendRequest);
router.delete("/unfriend/:friendId", unfriendUser);
router.get("/requests", getFriendRequests);
router.get("/requests/outgoing", getOutgoingFriendReqs);

export default router;
