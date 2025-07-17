import mongoose from "mongoose";

const friendSchema = new mongoose.Schema({
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create unique index on user1 and user2 fields
friendSchema.index({ user1: 1, user2: 1 }, { unique: true });

// Ensure user1 is always smaller ObjectId than user2 before saving
friendSchema.pre("save", function (next) {
  if (this.user1.toString() > this.user2.toString()) {
    const temp = this.user1;
    this.user1 = this.user2;
    this.user2 = temp;
  }
  next();
});

const Friend = mongoose.model("Friend", friendSchema);

export default Friend;
