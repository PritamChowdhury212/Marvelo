import express from "express";
import {
  getMyFriends,
  getRecommendedUsers,
  unfriendUser,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/my-friends", getMyFriends);
router.get("/recommended", getRecommendedUsers);
router.delete("/:friendId", unfriendUser);

export default router;
