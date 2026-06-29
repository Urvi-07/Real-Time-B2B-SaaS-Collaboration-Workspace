import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  "https://real-time-b2b-saas-collaboration.onrender.com";

// Get JWT token from localStorage
const token = localStorage.getItem("token");

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket"],

  // Send JWT to backend
  auth: {
    token,
  },
});

// Connected
socket.on("connect", () => {
  console.log("✅ Socket Connected");
  console.log("Socket ID:", socket.id);
});

// Disconnected
socket.on("disconnect", (reason) => {
  console.log("❌ Socket Disconnected");
  console.log("Reason:", reason);
});

// Connection Error
socket.on("connect_error", (error) => {
  console.error("❌ Socket Connection Error:", error.message);
});