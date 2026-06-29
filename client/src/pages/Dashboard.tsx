import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { socket } from "../socket/socket";

interface Workspace {
  id?: string;
  _id?: string;
  name: string;
  description?: string;
}

export default function Dashboard() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const res = await api.get("/workspaces");

      console.log("Workspace Response:", res.data);

      const data = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      setWorkspaces(data);
    } catch (err) {
      console.error(err);
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (socket.connected) {
      socket.disconnect();
    }

    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">

      {/* Header */}
      <div className="flex justify-between items-center mb-10">

        <div>
          <h1 className="text-4xl font-bold">
            Dashboard
          </h1>

          <p className="text-slate-400 mt-2">
            Manage your workspaces and collaborate with your team.
          </p>
        </div>

        <div className="flex gap-3">

          <button
            onClick={() => navigate("/workspaces")}
            className="bg-slate-800 hover:bg-slate-700 px-5 py-2 rounded-lg transition"
          >
            📂 View Workspaces
          </button>

          <button
            onClick={() => navigate("/workspaces/create")}
            className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg transition"
          >
            ➕ Create Workspace
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg transition"
          >
            🚪 Logout
          </button>

        </div>

      </div>

      {/* Loading */}

      {loading ? (
        <div className="text-center text-slate-400 text-lg">
          Loading workspaces...
        </div>
      ) : workspaces.length === 0 ? (

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">

          <h2 className="text-2xl font-bold mb-3">
            No Workspaces Found
          </h2>

          <p className="text-slate-400 mb-6">
            Create your first workspace to start collaborating.
          </p>

          <button
            onClick={() => navigate("/workspaces/create")}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition"
          >
            Create Workspace
          </button>

        </div>

      ) : (

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {workspaces.map((workspace) => {

            const workspaceId = workspace._id || workspace.id;

            return (

              <div
                key={workspaceId}
                onClick={() => navigate(`/workspaces/${workspaceId}`)}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 cursor-pointer hover:border-blue-500 hover:scale-105 transition-all duration-300"
              >

                <h2 className="text-2xl font-bold text-white">
                  {workspace.name}
                </h2>

                <p className="text-slate-400 mt-3 min-h-[50px]">
                  {workspace.description || "No description available."}
                </p>

                <div className="mt-6 flex justify-between items-center">

                  <span className="text-blue-400 font-medium">
                    View Details →
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/workspaces/${workspaceId}/chat`);
                    }}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm transition"
                  >
                    💬 Chat
                  </button>

                </div>

              </div>

            );
          })}

        </div>

      )}

    </div>
  );
}