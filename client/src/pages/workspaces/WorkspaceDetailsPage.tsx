import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";

interface Workspace {
  id: string;
  name: string;
  description?: string;
}

export default function WorkspaceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const res = await api.get(`/workspaces/${id}`);
        setWorkspace(res.data?.data || res.data);
      } catch (error) {
        console.error(error);
        setWorkspace(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspace();
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8">

        <h1 className="text-3xl font-bold text-white mb-2">
          Workspace Details
        </h1>

        <p className="text-slate-400 mb-8">
          View workspace information and collaborate with your team.
        </p>

        {loading ? (
          <p className="text-slate-400">Loading workspace...</p>
        ) : !workspace ? (
          <p className="text-red-400">Workspace not found.</p>
        ) : (
          <>
            <div className="bg-slate-800 rounded-xl p-5 mb-6">
              <h2 className="text-2xl font-semibold text-white">
                {workspace.name}
              </h2>

              <p className="text-slate-400 mt-3">
                {workspace.description || "No description available."}
              </p>
            </div>

            <div className="flex gap-3">

              <button
                onClick={() => navigate("/workspaces")}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg transition"
              >
                ← Back
              </button>

              <button
                onClick={() => navigate("/chat")}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition"
              >
                💬 Open Chat
              </button>

            </div>
          </>
        )}

      </div>
    </div>
  );
}