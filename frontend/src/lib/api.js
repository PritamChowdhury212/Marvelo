import { axiosInstance } from "./axios";

export const signup = async (signupData) => {
  const response = await axiosInstance.post("/auth/signup", signupData);
  return response.data;
};

export const login = async (loginData) => {
  const response = await axiosInstance.post("/auth/login", loginData);
  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

export const getAuthUser = async () => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  } catch (error) {
    console.log("Error in getAuthUser:", error);
    return null;
  }
};

export const completeOnboarding = async (userData) => {
  const response = await axiosInstance.post("/auth/onboarding", userData);
  return response.data;
};

export async function getUserFriends() {
  const response = await axiosInstance.get("/friends/my-friends");
  return response.data;
}

export async function getRecommendedUsers() {
  const response = await axiosInstance.get("/friends/recommended");
  return response.data;
}

export async function getOutgoingFriendReqs() {
  const response = await axiosInstance.get(
    "/friend-requests/requests/outgoing"
  );
  return response.data;
}

export async function sendFriendRequest(userId) {
  const response = await axiosInstance.post(`/friend-requests/send/${userId}`);
  return response.data;
}

export async function getFriendRequests() {
  const response = await axiosInstance.get("/friend-requests/requests");
  return response.data;
}

export async function acceptFriendRequest(requestId) {
  const response = await axiosInstance.post(
    `/friend-requests/accept/${requestId}`
  );
  return response.data;
}

export async function declineFriendRequest(requestId) {
  const response = await axiosInstance.post(
    `/friend-requests/decline/${requestId}`
  );
  return response.data;
}
export const unfriendUser = async (friendId) => {
  const response = await axiosInstance.delete(`/friends/${friendId}`);
  return response.data;
};

export async function getStreamToken() {
  const response = await axiosInstance.get("/chat/token");
  return response.data;
}

export const createGroup = async (groupData) => {
  const res = await axiosInstance.post("/groups", groupData);
  return res.data;
};

export const joinGroup = async ({ code }) => {
  const res = await axiosInstance.post("/groups/join", { code });
  return res.data;
};

export const getMyGroups = async () => {
  const res = await axiosInstance.get("/groups/my-groups");
  return res.data;
};

export const leaveGroup = async (groupId) => {
  const response = await axiosInstance.delete(`/groups/${groupId}/leave`);
  return response.data;
};
