import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { unfriendUser } from "../lib/api";
import { UserMinusIcon, MessageSquareIcon } from "lucide-react";
import toast from "react-hot-toast";

const FriendCard = ({ friend }) => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  const { mutate: unfriend, isPending: isUnfriending } = useMutation({
    mutationFn: () => unfriendUser(friend._id),
    onSuccess: () => {
      toast.success(`${friend.fullName} has been unfriended`);
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      setShowModal(false);
    },
    onError: (err) => {
      console.error("Failed to unfriend user", err);
      toast.error("Failed to unfriend. Please try again.");
      setShowModal(false);
    },
  });

  return (
    <div className="relative card bg-base-200 hover:shadow-md transition-shadow">
      {/* Unfriend Button */}
      <button
        className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700"
        onClick={() => setShowModal(true)}
        disabled={isUnfriending}
        title="Unfriend"
      >
        <UserMinusIcon className="size-5" />
      </button>

      <div className="card-body p-4 pt-6">
        {/* User Info */}
        <div className="flex items-center gap-3 mb-3">
          <div className="avatar size-12">
            <img
              src={friend.profilePic}
              alt={friend.fullName}
              className="rounded-full"
            />
          </div>
          <div>
            <h3 className="font-semibold truncate">{friend.fullName}</h3>
            {friend.bio && (
              <p className="text-sm text-gray-500 truncate max-w-xs">
                {friend.bio}
              </p>
            )}
          </div>
        </div>

        {/* Message Button */}
        <Link
          to={`/chat/${friend._id}`}
          className="btn btn-outline w-full flex items-center justify-center"
        >
          <MessageSquareIcon className="size-4 mr-2" />
          Message
        </Link>
      </div>

      {/* Unfriend Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded shadow-lg p-6 max-w-sm w-full text-center">
            <h3 className="text-lg font-semibold mb-4">Unfriend</h3>
            <p className="mb-6">
              Are you sure you want to unfriend{" "}
              <strong>{friend.fullName}</strong>?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => unfriend()}
                disabled={isUnfriending}
                className="btn btn-error"
              >
                {isUnfriending ? "Unfriending..." : "Unfriend"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-outline"
                disabled={isUnfriending}
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

export default FriendCard;
