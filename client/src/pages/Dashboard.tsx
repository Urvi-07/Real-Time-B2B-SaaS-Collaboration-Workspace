import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { socket } from "../socket/socket";

interface Workspace {
  id: string;
  name: string;
  description?: string;
}

export default function Dashboard() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchWorkspaces = async () => {
    try {
      const res = await api.get("/workspaces");
      setWorkspaces(res.data?.data || []);
    } catch (err) {
      console.log(err);
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleLogout = () => {
    // Disconnect Socket.IO
    if (socket.connected) {
      socket.disconnect();
    }

    // Remove JWT
    localStorage.removeItem("token");

    // Redirect
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-slate-400 text-sm">
            Manage your workspaces
          </p>
        </div>

        <div className="flex gap-3">

          <button
            onClick={() => navigate("/workspaces")}
            className="bg-slate-900 border border-slate-700 px-4 py-2 rounded-lg hover:bg-slate-800"
          >
            View
          </button>

          <button
            onClick={() => navigate("/workspaces/create")}
            className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Create
          </button>

          <button
            onClick={() => navigate("/chat")}
            className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700"
          >
            💬 Chat
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Logout
          </button>

        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : workspaces.length === 0 ? (
        <p className="text-slate-500">No workspaces found</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {workspaces.map((w) => (
            <div
              key={w.id}
              onClick={() => navigate(`/workspaces/${w.id}`)}
              className="bg-slate-900 border border-slate-800 p-5 rounded-xl cursor-pointer hover:bg-slate-800 transition"
            >
              <h2 className="font-semibold text-lg">{w.name}</h2>

              <p className="text-slate-400 text-sm mt-2">
                {w.description || "No description"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}