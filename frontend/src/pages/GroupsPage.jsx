import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyGroups, createGroup, joinGroup, leaveGroup } from "../lib/api";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { PlusIcon, LogOutIcon } from "lucide-react";

const GroupsPage = () => {
  const queryClient = useQueryClient();
  const { data: groupsData, isLoading } = useQuery({
    queryKey: ["myGroups"],
    queryFn: getMyGroups,
  });

  const [showDialog, setShowDialog] = useState(false);
  const [createGroupName, setCreateGroupName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [joinCode, setJoinCode] = useState("");
  const [groupToLeave, setGroupToLeave] = useState(null);

  const createGroupMutation = useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      toast.success("Group created successfully");
      setCreateGroupName("");
      setImageFile(null);
      setShowDialog(false);
      queryClient.invalidateQueries(["myGroups"]);
    },
    onError: () => toast.error("Failed to create group"),
  });

  const joinGroupMutation = useMutation({
    mutationFn: joinGroup,
    onSuccess: () => {
      toast.success("Joined group successfully");
      setJoinCode("");
      setShowDialog(false);
      queryClient.invalidateQueries(["myGroups"]);
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || "Failed to join group.";
      toast.error(msg);
    },
  });

  const leaveGroupMutation = useMutation({
    mutationFn: leaveGroup,
    onSuccess: () => {
      toast.success("Left group successfully");
      queryClient.invalidateQueries(["myGroups"]);
      setGroupToLeave(null);
    },
    onError: () => {
      toast.error("Failed to leave group");
      setGroupToLeave(null);
    },
  });

  const handleJoinGroup = (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return toast.error("Enter a group code");
    joinGroupMutation.mutate({ code: joinCode });
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!createGroupName.trim() || !imageFile) {
      toast.error("Enter a group name and select an image");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const imgbbApiKey = import.meta.env.VITE_IMGBB_API_KEY;
      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=${imgbbApiKey}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      if (!data.success) throw new Error("Image upload failed");

      const imageUrl = data.data.url;
      createGroupMutation.mutate({ name: createGroupName, image: imageUrl });
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-base-content">Your Groups</h1>
        <button
          onClick={() => setShowDialog(!showDialog)}
          className="btn btn-outline btn-sm"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>

      {isLoading ? (
        <p className="text-base-content">Loading groups...</p>
      ) : groupsData?.length === 0 ? (
        <p className="text-base-content opacity-70">
          You are not part of any groups yet.
        </p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groupsData.map((group) => (
            <li
              key={group._id}
              className="relative card bg-base-200 hover:shadow-lg transition-all duration-300 flex items-left space-x-4 p-4"
            >
              <button
                onClick={() => setGroupToLeave(group)}
                disabled={leaveGroupMutation.isLoading}
                title="Leave Group"
                className="absolute top-2 right-2 text-error hover:text-error-focus rounded-full p-1 hover:bg-error/10"
              >
                <LogOutIcon className="w-5 h-5" />
              </button>

              <Link
                to={`/group-chat/${group._id}`}
                className="flex items-center flex-grow space-x-4 no-underline"
              >
                {group.image ? (
                  <img
                    src={group.image}
                    alt="Group"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-base-300 flex items-center justify-center text-base-content font-semibold">
                    {group.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div>
                  <p className="font-semibold text-lg text-base-content">
                    {group.name}
                  </p>
                  <p className="text-sm opacity-70 text-base-content">
                    Code: {group.code}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Join/Create Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
          <div className="bg-base-100 p-6 rounded shadow-lg w-full max-w-md relative">
            <button
              onClick={() => setShowDialog(false)}
              className="absolute top-3 right-3 text-base-content hover:text-primary text-xl font-bold"
              aria-label="Close dialog"
            >
              &times;
            </button>

            <h2 className="text-xl font-semibold mb-4 text-base-content">
              Join or Create Group
            </h2>

            <form onSubmit={handleCreateGroup}>
              <input
                type="text"
                placeholder="Group name"
                value={createGroupName}
                onChange={(e) => setCreateGroupName(e.target.value)}
                className="input input-bordered w-full mb-2 bg-base-200 text-base-content"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="file-input file-input-bordered w-full mb-2 bg-base-200 text-base-content"
              />
              <button className="btn btn-primary w-full" type="submit">
                {createGroupMutation.isLoading ? "Creating..." : "Create Group"}
              </button>
            </form>

            <form onSubmit={handleJoinGroup} className="mt-4">
              <input
                type="text"
                placeholder="Group code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="input input-bordered w-full mb-2 bg-base-200 text-base-content"
              />
              <button className="btn btn-primary w-full" type="submit">
                {joinGroupMutation.isLoading ? "Joining..." : "Join Group"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Leave Confirmation */}
      {groupToLeave && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-base-100 rounded shadow-lg p-6 max-w-sm w-full text-center">
            <h3 className="text-lg font-semibold mb-4 text-base-content">
              Leave Group
            </h3>
            <p className="mb-6 text-base-content">
              Are you sure you want to leave{" "}
              <strong>{groupToLeave.name}</strong>?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => leaveGroupMutation.mutate(groupToLeave._id)}
                disabled={leaveGroupMutation.isLoading}
                className="btn btn-error"
              >
                {leaveGroupMutation.isLoading ? "Leaving..." : "Leave"}
              </button>
              <button
                onClick={() => setGroupToLeave(null)}
                className="btn btn-outline"
                disabled={leaveGroupMutation.isLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupsPage;
