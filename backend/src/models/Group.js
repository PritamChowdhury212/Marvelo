import mongoose from "mongoose";
import { nanoid } from "nanoid";

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: {
      type: String,
      unique: true,
      default: () => nanoid(6),
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: {
      type: String, // URL from imgbb
      default: "",
    },
  },
  { timestamps: true }
);

const Group = mongoose.model("Group", groupSchema);
export default Group;
