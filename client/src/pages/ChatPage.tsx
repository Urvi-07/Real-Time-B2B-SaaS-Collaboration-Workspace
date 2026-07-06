import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { socket,connectSocket } from "../socket/socket";

interface Message {
  _id?: string;
  sender?: {
    name?: string;
    email?: string;
  };
  content: string;
  createdAt?: string;
}

 export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Workspace not found.
      </div>
    );
  }

  const workspaceId = id;

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [connected, setConnected] = useState(socket.connected);
  const [typing, setTyping] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    
  connectSocket();
    
    socket.emit("join-workspace", workspaceId);

    console.log("Joined Workspace:", workspaceId);

    const onConnect = () => {
      setConnected(true);
    };

    const onDisconnect = () => {
      setConnected(false);
    };

    const onMessage = (msg: Message) => {
  console.log("Received Message:", msg);

  setMessages((prev) => {
    const exists = prev.some(
      (m) =>
        m.content === msg.content &&
        m.sender?.name === msg.sender?.name &&
        m.createdAt === msg.createdAt
    );

    return exists ? prev : [...prev, msg];
  }); 
};

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    socket.on("broadcast-message", (msg: Message) => {
  console.log("🔥 Broadcast Received:", msg);
  onMessage(msg);
});

    socket.on("typing-start", () => setTyping(true));
    socket.on("typing-stop", () => setTyping(false));

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("broadcast-message", onMessage);
      socket.off("typing-start");
      socket.off("typing-stop");
    };
  }, [workspaceId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const handleTyping = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setMessage(e.target.value);

    socket.emit("typing-start", workspaceId);

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    typingTimeout.current = setTimeout(() => {
  socket.emit("typing-stop", workspaceId);
}, 1000);
  };

  const handleSend = () => {
    if (!message.trim()) return;

    const myMessage: Message = {
      _id: Date.now().toString(),
      sender: {
        name: "You",
      },
      content: message,
      createdAt: new Date().toISOString(),
    };

    // Show immediately
    setMessages((prev) => [...prev, myMessage]);
    console.log("📤 Sending:", {
  workspaceId,
  content: message,
});

    socket.emit("send-message", {
      workspaceId,
      content: message,
    });

    socket.emit("typing-stop", workspaceId);

    setMessage("");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl h-[85vh] bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 flex flex-col">

       {/* Header */}
<div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">

  <div className="flex items-center gap-4">

    <button
      onClick={() => navigate(`/workspaces/${workspaceId}`)}
      className="h-10 w-10 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 transition"
    >
      ←
    </button>

    <div>
      <h1 className="text-2xl font-bold text-white">
        💬 Workspace Chat
      </h1>

      <p className="text-slate-400 text-sm">
        Workspace ID: {workspaceId}
      </p>
    </div>

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
<div className="flex-1 overflow-y-auto p-6 bg-slate-950 space-y-4">

  {messages.length === 0 ? (
    <div className="h-full flex flex-col items-center justify-center text-slate-500">
      <div className="text-6xl mb-4">💬</div>
      <p className="text-lg">No messages yet</p>
      <p className="text-sm mt-2">
        Start the conversation with your teammates.
      </p>
    </div>
  ) : (
    messages.map((msg, index) => {
      const isMe = msg.sender?.name === "You";
      return (
        <div
          key={msg._id || index}
          className={`flex ${
            isMe ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-lg transition-all duration-200 ${
              isMe
                ? "bg-blue-600 rounded-br-md"
                : "bg-slate-800 rounded-bl-md"
            }`}
          >
            {!isMe && (
              <p className="text-xs font-semibold text-blue-400 mb-1">
                {msg.sender?.name || "User"}
              </p>
            )}

            <p className="text-white break-words">
              {msg.content}
            </p>

            <p className="text-[10px] text-right mt-2 opacity-70">
              {msg.createdAt
                ? new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </p>
          </div>
        </div>
      );
    })
  )}

  {typing && (
    <div className="flex justify-start">
      <div className="bg-slate-800 px-4 py-2 rounded-xl">
        <p className="text-green-400 text-sm animate-pulse">
          Someone is typing...
        </p>
      </div>
    </div>
  )}

  <div ref={bottomRef}></div>

</div>

        {/* Input */}
        <div className="border-t border-slate-800 p-5">
          <div className="flex gap-3">

            <input
              type="text"
              value={message}
              onChange={handleTyping}
              placeholder="Type a message..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSend();
                }
              }}
            />

            <button
              onClick={handleSend}
              disabled={!connected}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white px-8 rounded-xl"
            >
              Send
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}