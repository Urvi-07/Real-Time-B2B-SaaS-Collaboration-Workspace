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
  const navigate = useNavigate();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const res = await api.get("/workspaces");

      const data = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      setWorkspaces(data);
    } catch (error) {
      console.error(error);
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (socket.connected) socket.disconnect();

    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700">

        <div className="max-w-7xl mx-auto px-8 py-10 flex justify-between items-center">

          <div>

            <h1 className="text-5xl font-bold">
              Welcome Back 👋
            </h1>

            <p className="text-blue-100 mt-3 text-lg">
              Manage your workspaces and collaborate with your team in real time.
            </p>

          </div>

          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl font-semibold transition"
          >
            Logout
          </button>

        </div>

      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">

        {/* Statistics */}

        <div className="grid md:grid-cols-3 gap-6 mb-10">

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <p className="text-slate-400">
              Total Workspaces
            </p>

            <h2 className="text-4xl font-bold mt-2 text-blue-400">
              {workspaces.length}
            </h2>

          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <p className="text-slate-400">
              Connection
            </p>

            <h2
              className={`text-3xl font-bold mt-2 ${
                socket.connected ? "text-green-400" : "text-red-400"
              }`}
            >
              {socket.connected ? "Online" : "Offline"}
            </h2>

          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">

            <p className="text-slate-400">
              Quick Action
            </p>

            <button
              onClick={() => navigate("/workspaces/create")}
              className="mt-5 bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-semibold transition"
            >
              + Create Workspace
            </button>

          </div>

        </div>

        {/* Toolbar */}

        <div className="flex justify-between items-center mb-8">

          <div>

            <h2 className="text-3xl font-bold">
              Your Workspaces
            </h2>

            <p className="text-slate-400 mt-1">
              Access and collaborate with your teams.
            </p>

          </div>

          <button
            onClick={() => navigate("/workspaces")}
            className="bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-xl transition"
          >
            View All
          </button>

        </div>

        {/* Loading */}

        {loading ? (

          <div className="text-center py-20 text-slate-400 text-xl">
            Loading workspaces...
          </div>

        ) : workspaces.length === 0 ? (

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center">

            <h2 className="text-3xl font-bold mb-4">
              No Workspaces Yet
            </h2>

            <p className="text-slate-400 mb-8">
              Create your first workspace and start collaborating instantly.
            </p>

            <button
              onClick={() => navigate("/workspaces/create")}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl font-semibold transition"
            >
              Create Workspace
            </button>

          </div>

        ) : (

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">

            {workspaces.map((workspace) => {

              const workspaceId = workspace._id || workspace.id;

              return (

                <div
                  key={workspaceId}
                  className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 hover:border-blue-500 hover:-translate-y-2 transition-all duration-300 shadow-lg"
                >

                  {/* Top Gradient */}

                  <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

                  <div className="p-7">

                    <div className="flex items-center justify-between">

                      <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-2xl">
                        📁
                      </div>

                      <span className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-300">
                        Workspace
                      </span>

                    </div>

                    <h2 className="text-2xl font-bold mt-6">
                      {workspace.name}
                    </h2>

                    <p className="text-slate-400 mt-3 min-h-[70px] leading-relaxed">
                      {workspace.description ||
                        "No description available."}
                    </p>

                    <div className="flex gap-3 mt-8">

                      <button
                        onClick={() =>
                          navigate(`/workspaces/${workspaceId}`)
                        }
                        className="flex-1 bg-slate-800 hover:bg-slate-700 py-3 rounded-xl font-semibold transition"
                      >
                        View Details
                      </button>

                      <button
                        onClick={() =>
                          navigate(`/workspaces/${workspaceId}/chat`)
                        }
                        className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-xl font-semibold transition"
                      >
                        💬 Chat
                      </button>

                    </div>

                  </div>

                </div>

              );
            })}

          </div>

        )}

      </div>

    </div>
  );
}