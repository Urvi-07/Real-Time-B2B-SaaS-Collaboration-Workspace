import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket"],
});

// Connected
socket.on("connect", () => {
  console.log("✅ Socket Connected:", socket.id);
});

// Disconnected
socket.on("disconnect", (reason) => {
  console.log("❌ Socket Disconnected:", reason);
});

// Connection Error
socket.on("connect_error", (error) => {
  console.error("❌ Socket Connection Error:", error.message);
});