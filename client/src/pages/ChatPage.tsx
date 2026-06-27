import { useEffect, useRef, useState } from "react";
import { socket } from "../socket/socket";

interface Message {
  sender: string;
  text: string;
  time: string;
}

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [connected, setConnected] = useState(socket.connected);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleConnect = () => {
      console.log("✅ Socket Connected");
      setConnected(true);
    };

    const handleDisconnect = () => {
      console.log("❌ Socket Disconnected");
      setConnected(false);
    };

    const handleReceiveMessage = (data: Message) => {
      setMessages((prev) => [...prev, data]);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("receive_message", handleReceiveMessage);

    setConnected(socket.connected);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("receive_message", handleReceiveMessage);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim() || !connected) return;

    const newMessage: Message = {
      sender: "You",
      text: message,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // Show instantly
    setMessages((prev) => [...prev, newMessage]);

    // Send to backend
    socket.emit("send_message", newMessage);

    setMessage("");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">

      <div className="w-full max-w-5xl h-[85vh] bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900 rounded-t-2xl">

          <div>
            <h1 className="text-2xl font-bold text-white">
              💬 Workspace Chat
            </h1>

            <p className="text-slate-400 text-sm">
              Collaborate with your teammates in real time
            </p>
          </div>

          <div
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              connected
                ? "bg-green-600 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            {connected ? "🟢 Connected" : "🔴 Disconnected"}
          </div>

        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950">

          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-lg">
              Start the conversation 👋
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMe = msg.sender === "You";

              return (
                <div
                  key={index}
                  className={`flex ${
                    isMe ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-sm md:max-w-md px-4 py-3 rounded-2xl shadow-lg ${
                      isMe
                        ? "bg-blue-600 text-white"
                        : "bg-slate-800 text-white"
                    }`}
                  >
                    <p className="font-semibold text-sm">
                      {msg.sender}
                    </p>

                    <p className="mt-2 break-words">
                      {msg.text}
                    </p>

                    <p className="text-xs mt-2 text-right text-slate-300">
                      {msg.time}
                    </p>
                  </div>
                </div>
              );
            })
          )}

          <div ref={bottomRef}></div>

        </div>

        {/* Input */}
        <div className="border-t border-slate-800 p-5 bg-slate-900 rounded-b-2xl">

          <div className="flex gap-3">

            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSend();
                }
              }}
            />

            <button
              onClick={handleSend}
              disabled={!connected}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-semibold px-8 rounded-xl transition"
            >
              Send
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}