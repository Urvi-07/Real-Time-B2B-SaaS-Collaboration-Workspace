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

  // Invite Member States
  const [showInvite, setShowInvite] = useState(false);
  const [userId, setUserId] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [message, setMessage] = useState("");

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

  // Invite Member API
  const handleInvite = async () => {
    if (!userId.trim()) {
      setMessage("Please enter a User ID.");
      return;
    }

    try {
      setInviteLoading(true);

      const res = await api.post(`/workspaces/${id}/members`, {
        userId,
      });

      setMessage(res.data?.message || "Member invited successfully!");

      setUserId("");

      setTimeout(() => {
        setShowInvite(false);
        setMessage("");
      }, 1500);

    } catch (err: any) {
      console.error(err);

      setMessage(
        err.response?.data?.message ||
          "Failed to invite member."
      );
    } finally {
      setInviteLoading(false);
    }
  };

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
            {/* Workspace Card */}

            <div className="bg-slate-800 rounded-xl p-5 mb-6">

              <h2 className="text-2xl font-semibold text-white">
                {workspace.name}
              </h2>

              <p className="text-slate-400 mt-3">
                {workspace.description || "No description available."}
              </p>

            </div>

            {/* Buttons */}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

              <button
                onClick={() => navigate("/workspaces")}
                className="bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg transition"
              >
                ← Back
              </button>

              <button
                onClick={() => navigate(`/workspaces/${id}/chat`)}
                className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition"
              >
                💬 Open Chat
              </button>

              <button
                onClick={() => setShowInvite(!showInvite)}
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition"
              >
                ➕ Invite Member
              </button>

            </div>

            {/* Invite Member */}

            {showInvite && (
              <div className="mt-6 bg-slate-800 rounded-xl p-5">

                <h3 className="text-white text-lg font-semibold mb-4">
                  Invite Member
                </h3>

                <input
                  type="text"
                  placeholder="Enter User ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {message && (
                  <p
                    className={`mt-3 text-sm ${
                      message.includes("success")
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {message}
                  </p>
                )}

                <button
                  onClick={handleInvite}
                  disabled={inviteLoading}
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white py-3 rounded-lg transition"
                >
                  {inviteLoading ? "Inviting..." : "Invite Member"}
                </button>

              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}