// lib/streamClient.js
import { StreamChat } from "stream-chat";
import { axiosInstance } from "./axios"; // your axios instance

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

let chatClient = null; // Singleton Stream client
let connectUserPromise = null; // Stores promise to prevent multiple connectUser calls

// Get or create the StreamChat client
export const getChatClient = () => {
  if (!chatClient) {
    chatClient = StreamChat.getInstance(STREAM_API_KEY);
  }
  return chatClient;
};

// Connect user (runs only once, returns promise)
export const connectStreamUser = (authUser) => {
  if (!connectUserPromise) {
    connectUserPromise = (async () => {
      // Get Stream token from your backend
      const { data } = await axiosInstance.post("/stream/user", {
        id: authUser._id,
        name: authUser.fullName,
        image: authUser.profilePic || null,
      });

      // Connect user to Stream
      await getChatClient().connectUser(
        {
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePic || null,
        },
        data.token
      );

      return getChatClient();
    })();
  }

  return connectUserPromise; // returns the same promise if called again
};
