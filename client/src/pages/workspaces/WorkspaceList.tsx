import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

export default function WorkspaceList() {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login", { replace: true });
          return;
        }

        const res = await api.get("/workspaces");

        console.log("WORKSPACES:", res.data);

        // ✅ SAFE NORMALIZATION
        const data =
          res.data?.data || res.data || [];

        setWorkspaces(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error(err);
        setError(
          err.response?.data?.message || "Failed to load workspaces"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, []); // ✅ FIXED (no navigate dependency)

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6">
        Loading workspaces...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <h1 className="text-3xl font-bold text-white mb-6">
        My Workspaces
      </h1>

      {error && (
        <p className="text-red-400 mb-4">{error}</p>
      )}

      {workspaces.length === 0 ? (
        <p className="text-slate-400">
          No workspaces found.
        </p>
      ) : (
        <div className="grid gap-4">
          {workspaces.map((workspace: any) => (
            <div
              key={workspace._id}
              onClick={() =>
                navigate(`/workspaces/${workspace._id}`)
              }
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 cursor-pointer hover:bg-slate-800 transition"
            >
              <h2 className="text-white text-lg font-semibold">
                {workspace.name}
              </h2>

              <p className="text-slate-400 mt-2">
                {workspace.description || "No description provided"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}