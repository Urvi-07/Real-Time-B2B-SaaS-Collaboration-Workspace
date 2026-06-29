import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

interface Workspace {
  id?: string;
  _id?: string;
  name: string;
  description?: string;
}

export default function WorkspacePage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const res = await api.get("/workspaces");

      console.log("Workspace API Response:", res.data);

      const data = res.data?.data || res.data || [];

      setWorkspaces(data);
    } catch (error) {
      console.error(error);
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-3xl font-bold">
            My Workspaces
          </h1>

          <p className="text-slate-400 mt-1">
            Manage and collaborate with your team.
          </p>
        </div>

        <div className="flex gap-3">

          <button
            onClick={() => navigate("/dashboard")}
            className="bg-slate-700 hover:bg-slate-600 px-5 py-2 rounded-lg"
          >
            ← Dashboard
          </button>

          <button
            onClick={() => navigate("/workspaces/create")}
            className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg"
          >
            + Create Workspace
          </button>

        </div>

      </div>

      {/* Content */}

      {loading ? (
        <div className="text-center text-slate-400 text-lg">
          Loading workspaces...
        </div>
      ) : workspaces.length === 0 ? (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-10 text-center">

          <h2 className="text-2xl font-semibold mb-3">
            No Workspaces Found
          </h2>

          <p className="text-slate-400 mb-6">
            Create your first workspace to start collaborating.
          </p>

          <button
            onClick={() => navigate("/workspaces/create")}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg"
          >
            Create Workspace
          </button>

        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">

          {workspaces.map((workspace) => {
            const workspaceId = workspace._id || workspace.id;

            return (
              <div
                key={workspaceId}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500 hover:scale-105 transition duration-300"
              >
                <h2 className="text-2xl font-bold text-white">
                  {workspace.name}
                </h2>

                <p className="text-slate-400 mt-3">
                  {workspace.description || "No description available"}
                </p>

                {/* Debug ID */}
                <p className="text-xs text-green-400 mt-4">
                  Workspace ID: {workspaceId}
                </p>

                <div className="flex gap-3 mt-6">

                  <button
                    onClick={() =>
                      navigate(`/workspaces/${workspaceId}`)
                    }
                    className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() =>
                      navigate(`/workspaces/${workspaceId}/chat`)
                    }
                    className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded-lg"
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