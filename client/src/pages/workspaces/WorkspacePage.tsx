import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function WorkspacePage() {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/workspaces");
        setWorkspaces(res.data?.data || []);
      } catch {
        setWorkspaces([]);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">

      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Workspaces</h1>

        <button
          onClick={() => navigate("/workspaces/create")}
          className="bg-blue-600 px-4 py-2 rounded"
        >
          + Create
        </button>
      </div>

      {workspaces.length === 0 ? (
        <p className="text-slate-400">No workspaces found</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {workspaces.map((w) => (
            <div
              key={w.id}
              onClick={() => navigate(`/workspaces/${w.id}`)}
              className="bg-slate-900 border border-slate-800 p-5 rounded-xl cursor-pointer"
            >
              {w.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}