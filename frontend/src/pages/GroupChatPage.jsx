import { useEffect, useState } from "react";
import { useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";
import { axiosInstance } from "../lib/axios";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const GroupChatPage = () => {
  const { id: groupId } = useParams();
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [groupMembers, setGroupMembers] = useState([]);

  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser) return;

      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        //  Fetch group info from backend
        console.log("Fetching group info for ID:", groupId);
        const res = await axiosInstance.get(`/groups/${groupId}`);
        const members = res.data.members.map((m) => m._id);

        setGroupMembers(members);

        const groupChannel = client.channel("messaging", groupId, {
          name: `Group ${groupId}`,
          members: groupMembers, // use members fetched from backend group data
        });

        try {
          await groupChannel.create();
        } catch (err) {
          if (err.message !== "Channel already exists") {
            throw err;
          }
        }

        await groupChannel.watch();

        setChatClient(client);
        setChannel(groupChannel);
      } catch (error) {
        console.error("Error initializing group chat:", error);
        toast.error("Could not load group chat.");
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [tokenData, authUser, groupId]);

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;
      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });
      toast.success("Video call link sent!");
    }
  };

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="h-[93vh]">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative">
            <CallButton handleVideoCall={handleVideoCall} />
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus />
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};

export default GroupChatPage;
