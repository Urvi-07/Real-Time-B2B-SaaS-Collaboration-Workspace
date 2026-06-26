import { useState } from "react";

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  const handleSend = () => {
    if (!message.trim()) return;

    setMessages((prev) => [...prev, `You: ${message}`]);
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="bg-white w-full max-w-3xl h-[80vh] rounded-xl shadow-lg flex flex-col">
        <div className="bg-blue-600 text-white p-4 rounded-t-xl">
          <h2 className="text-xl font-bold">Workspace Chat</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center mt-10">
              No messages yet.
            </p>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className="bg-blue-100 p-2 rounded-lg w-fit"
              >
                {msg}
              </div>
            ))
          )}
        </div>

        <div className="border-t p-4 flex gap-2">
          <input
            type="text"
            className="flex-1 border rounded-lg px-3 py-2"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />

          <button
            onClick={handleSend}
            className="bg-blue-600 text-white px-5 rounded-lg hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}