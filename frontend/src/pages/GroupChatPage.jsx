import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router";
import {
  Chat,
  Channel,
  ChannelHeader,
  Window,
  MessageList,
  MessageInput,
  Thread,
} from "stream-chat-react";
import toast from "react-hot-toast";
import { UserPlus2Icon, ArrowLeftIcon } from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";
import { axiosInstance } from "../lib/axios";
import { connectStreamUser } from "../lib/streamClient";

const GroupChatPage = () => {
  const { id: groupId } = useParams();
  const { authUser } = useAuthUser();

  const [chatClient, setChatClient] = useState(null);
  const [groupChannel, setGroupChannel] = useState(null);
  const [activeChannel, setActiveChannel] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showRecipientModal, setShowRecipientModal] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState([]);

  const pmListenersRef = useRef({});
  const activeChannelRef = useRef(null); // REF for latest active channel
  const isPm = activeChannel?.id?.startsWith("pm_");

  // Keep ref updated
  useEffect(() => {
    activeChannelRef.current = activeChannel;
  }, [activeChannel]);

  //  Toggle recipient: only allow one recipient & fix double toast
  const toggleRecipient = (userId) => {
    setSelectedRecipients((prev) => {
      // If already selected -> unselect (no toast)
      if (prev.includes(userId)) return [];

      // If trying to select a second user -> show toast once
      if (prev.length >= 1) {
        if (!toggleRecipient.hasShownToast) {
          toast.error("You can only message one person at a time.");
          toggleRecipient.hasShownToast = true; // flag
        }
        return prev;
      }

      // Normal selection
      toggleRecipient.hasShownToast = false; // reset flag
      return [userId];
    });
  };

  //  Initialize group chat
  useEffect(() => {
    if (!authUser?._id) return;

    const initGroupChat = async () => {
      setLoading(true);
      try {
        const client = await connectStreamUser(authUser);
        setChatClient(client);

        const res = await axiosInstance.get(`/groups/${groupId}`);
        const members = res.data.members.map((m) => ({
          id: m._id,
          name: m.fullName || m.username || "Unknown",
          image: m.profilePic || null,
        }));
        setGroupMembers(members);

        const gChannel = client.channel("messaging", groupId, {
          name: `Group ${groupId}`,
          members: members.map((m) => m.id),
        });

        try {
          await gChannel.create();
        } catch (err) {
          if (!err.message.includes("exists")) throw err;
        }

        await gChannel.watch();
        setGroupChannel(gChannel);
        setActiveChannel(gChannel);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load group chat");
      } finally {
        setLoading(false);
      }
    };

    initGroupChat();
  }, [authUser?._id, groupId]);

  //  Open or create PM channel
  const openPmChannel = async () => {
    if (!selectedRecipients.length || !chatClient || !authUser) return;

    const pmChannelId = `pm_${[authUser._id, ...selectedRecipients]
      .sort()
      .join("_")}`;

    const [existingChannel] = await chatClient.queryChannels({
      type: "messaging",
      id: { $eq: pmChannelId },
    });

    let pmChannel = existingChannel;

    if (!existingChannel) {
      pmChannel = chatClient.channel("messaging", pmChannelId, {
        members: [authUser._id, ...selectedRecipients],
        name: `Private chat with ${selectedRecipients
          .map((id) => groupMembers.find((m) => m.id === id)?.name || "Unknown")
          .join(", ")}`,
      });
      await pmChannel.create();
    }

    await pmChannel.watch();

    setActiveChannel(pmChannel);
    setSelectedRecipients([]);
    setShowRecipientModal(false);
  };

  // Attach PM notifications (only if not currently viewing that channel)
  useEffect(() => {
    if (!chatClient || !authUser) return;

    const attachPmListeners = async () => {
      const channels = await chatClient.queryChannels({
        type: "messaging",
        members: { $in: [authUser._id] },
      });

      channels.forEach((chan) => {
        if (!chan.id.startsWith("pm_")) return;
        if (pmListenersRef.current[chan.id]) return;

        const listener = (event) => {
          if (event.message?.user?.id === authUser._id) return;

          // Use ref to check latest active channel
          if (activeChannelRef.current?.id === chan.id) return;

          const sender = event.message?.user?.name || "Someone";

          toast(
            (t) => (
              <div
                className="cursor-pointer"
                onClick={() => {
                  setActiveChannel(chan);
                  toast.dismiss(t.id);
                }}
              >
                💬 New message from {sender}
              </div>
            ),
            {
              duration: 5000,
              position: "top-right",
              style: { pointerEvents: "auto" },
            }
          );
        };

        chan.on("message.new", listener);
        pmListenersRef.current[chan.id] = listener;
      });
    };

    attachPmListeners();
  }, [chatClient, authUser]);

  //  Send message
  const sendMessage = async (text) => {
    if (!text?.trim()) return toast.error("Enter a message.");
    if (!chatClient || !authUser || !activeChannel) return;

    try {
      await activeChannel.sendMessage({ text });
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message.");
    }
  };

  const getPmTitle = () => {
    const members = activeChannel?.state?.members || {};
    const others = Object.values(members).filter(
      (m) => m.user?.id !== authUser._id
    );
    const names = others.map((m) => m.user?.name || "Unknown");
    if (names.length === 1) return `Private chat with ${names[0]}`;
    return "Private Chat";
  };

  if (loading || !chatClient || !activeChannel) return <ChatLoader />;

  return (
    <div className="h-[93vh] flex flex-col">
      <Chat client={chatClient}>
        <Channel channel={activeChannel}>
          <div className="w-full relative h-full flex flex-col">
            {!isPm && <CallButton handleVideoCall={() => {}} />}

            <Window>
              {isPm && groupChannel ? (
                <div className="flex items-center gap-2 p-2 border-b border-base-300 bg-base-200">
                  <button
                    onClick={() => setActiveChannel(groupChannel)}
                    className="btn btn-ghost btn-sm p-1"
                    title="Back to Group"
                  >
                    <ArrowLeftIcon className="w-5 h-5" />
                  </button>
                  <h2 className="text-base font-semibold truncate">
                    {getPmTitle()}
                  </h2>
                </div>
              ) : (
                <ChannelHeader
                  title={activeChannel?.data?.name || "Group Chat"}
                />
              )}

              <MessageList />

              <div className="relative flex items-center">
                <MessageInput focus sendMessage={sendMessage} />
                {!isPm && (
                  <button
                    type="button"
                    onClick={() => setShowRecipientModal(true)}
                    className="absolute right-16 top-1/2 -translate-y-1/2 p-0 text-base-content hover:bg-transparent focus:outline-none select-none appearance-none"
                    style={{ transform: "translateY(0) !important" }}
                    title="Select recipient"
                  >
                    <UserPlus2Icon className="w-5 h-5" />
                  </button>
                )}
              </div>
            </Window>

            <Thread />
          </div>
        </Channel>
      </Chat>

      {showRecipientModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-base-100 p-6 rounded-lg shadow-lg w-full max-w-sm relative">
            <button
              onClick={() => setShowRecipientModal(false)}
              className="absolute top-2 right-3 text-xl font-bold hover:text-error"
            >
              &times;
            </button>
            <h3 className="text-lg font-semibold mb-4 text-base-content">
              Select Recipient
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {groupMembers
                .filter((m) => m.id !== authUser._id)
                .map((m) => (
                  <label
                    key={m.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <img
                      src={m.image || "/default-avatar.png"}
                      alt={m.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <input
                      type="checkbox"
                      checked={selectedRecipients.includes(m.id)}
                      onChange={() => toggleRecipient(m.id)}
                      className="checkbox checkbox-sm"
                    />
                    <span className="text-base-content">{m.name}</span>
                  </label>
                ))}
            </div>
            <button
              onClick={openPmChannel}
              className="btn btn-primary w-full mt-4"
            >
              Open Chat
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupChatPage;
