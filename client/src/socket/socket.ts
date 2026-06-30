import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  "https://real-time-b2b-saas-collaboration.onrender.com";

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket"],
});

// Before connecting, set the latest JWT
export const connectSocket = () => {
  socket.auth = {
    token: localStorage.getItem("token"),
  };

  if (!socket.connected) {
    socket.connect();
  }
};

socket.on("connect", () => {
  console.log("✅ Socket Connected");
  console.log("Socket ID:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("❌ Socket Disconnected");
  console.log("Reason:", reason);
});

socket.on("connect_error", (error) => {
  console.error("❌ Socket Connection Error:", error.message);
});