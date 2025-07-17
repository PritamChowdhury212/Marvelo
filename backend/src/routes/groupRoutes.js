import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createGroup,
  joinGroup,
  getMyGroups,
  getGroupDetails,
  leaveGroup,
} from "../controllers/groupController.js";

const router = express.Router();

router.post("/", protectRoute, createGroup);
router.post("/join", protectRoute, joinGroup);
router.get("/my-groups", protectRoute, getMyGroups);
router.get("/:groupId", protectRoute, getGroupDetails);
router.delete("/:groupId/leave", protectRoute, leaveGroup);

export default router;
