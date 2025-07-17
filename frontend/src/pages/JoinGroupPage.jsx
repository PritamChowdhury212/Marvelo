import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createGroup, joinGroup } from "../lib/api";
import toast from "react-hot-toast";

const JoinGroupPage = () => {
  const [groupName, setGroupName] = useState("");
  const [groupId, setGroupId] = useState("");
  const navigate = useNavigate();

  const handleCreateGroup = async () => {
    try {
      if (!groupName.trim()) return toast.error("Enter a group name");
      const res = await createGroup({ name: groupName });
      toast.success("Group created!");

      navigate(`/group-chat/${res._id || res.groupId}`);
    } catch (err) {
      toast.error("Could not create group");
    }
  };

  const handleJoinGroup = async () => {
    try {
      if (!groupId.trim()) return toast.error("Enter a group ID");
      await joinGroup({ code: groupId });
      toast.success("Joined group!");
      navigate(`/group-chat/${groupId}`);
    } catch (err) {
      toast.error("Could not join group");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Group Chat</h2>

      <div className="mb-6">
        <h3 className="text-xl mb-2">Create a Group</h3>
        <input
          type="text"
          placeholder="Enter group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="w-full border p-2 rounded mb-2"
        />
        <button
          onClick={handleCreateGroup}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          Create Group
        </button>
      </div>

      <div>
        <h3 className="text-xl mb-2">Join a Group</h3>
        <input
          type="text"
          placeholder="Enter group ID"
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          className="w-full border p-2 rounded mb-2"
        />
        <button
          onClick={handleJoinGroup}
          className="bg-green-600 text-white px-4 py-2 rounded w-full"
        >
          Join Group
        </button>
      </div>
    </div>
  );
};

export default JoinGroupPage;
