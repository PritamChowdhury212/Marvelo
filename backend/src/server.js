import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";
import friendRoutes from "./routes/friend.route.js";
import friendRequestRoutes from "./routes/friendRequest.route.js";
import groupRoutes from "./routes/groupRoutes.js";

import { connectDB } from "./lib/db.js";
import { protectRoute } from "./middleware/auth.middleware.js";

const app = express();
const PORT = process.env.PORT;

const __dirname = path.resolve();

app.use(
  cors({
    origin: "http://localhost:5173", // frontend origin
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Public routes (no authentication needed)
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

// Protected routes (require authentication)
app.use("/api/friends", protectRoute, friendRoutes);
app.use("/api/friend-requests", protectRoute, friendRequestRoutes);
app.use("/api/groups", protectRoute, groupRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// Connect to DB and start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to DB", error);
  });
