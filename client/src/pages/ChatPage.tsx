import { useEffect, useState } from "react";
import { socket } from "../socket";

interface Message {
  sender: string;
  text: string;
  time: string;
}

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      setConnected(true);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("receive_message", (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("receive_message");
    };
  }, []);

  const handleSend = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      sender: "You",
      text: message,
      time: new Date().toLocaleTimeString(),
    };

    // Show instantly in UI
    setMessages((prev) => [...prev, newMessage]);

    // Send to backend (works when backend events are ready)
    socket.emit("send_message", newMessage);

    setMessage("");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex justify-center items-center p-6">
      <div className="bg-slate-900 w-full max-w-3xl h-[80vh] rounded-xl shadow-lg flex flex-col border border-slate-800">

        {/* Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-xl flex justify-between items-center">
          <h2 className="text-xl font-bold">💬 Workspace Chat</h2>

          <span
            className={`text-sm px-3 py-1 rounded-full ${
              connected ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <p className="text-slate-400 text-center mt-10">
              No messages yet.
            </p>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className="bg-blue-600 text-white rounded-lg p-3 max-w-sm"
              >
                <p className="font-semibold">{msg.sender}</p>
                <p>{msg.text}</p>
                <p className="text-xs text-blue-100 mt-1">
                  {msg.time}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div className="border-t border-slate-700 p-4 flex gap-2">
          <input
            type="text"
            className="flex-1 bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />

          <button
            onClick={handleSend}
            disabled={!connected}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-5 rounded-lg"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}