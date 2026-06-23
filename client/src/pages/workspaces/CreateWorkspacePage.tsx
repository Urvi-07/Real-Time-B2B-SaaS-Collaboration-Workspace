import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function CreateWorkspacePage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleCreate = async () => {
    try {
      setLoading(true);

      const res = await api.post("/workspaces", {
        name,
        description,
      });

      console.log("CREATE RESPONSE:", res.data);

      if (res.data?.success) {
        navigate("/dashboard");
      } else {
        alert(res.data?.message || "Failed");
      }
    } catch (err: any) {
      console.log(err.response?.data || err.message);
      alert("Workspace not created");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-[400px]">

        <h1 className="text-xl font-bold mb-6">
          Create Workspace
        </h1>

        <input
          className="w-full p-3 mb-3 rounded bg-slate-800 border border-slate-700"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <textarea
          className="w-full p-3 mb-4 rounded bg-slate-800 border border-slate-700"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full bg-blue-600 py-3 rounded hover:bg-blue-700"
        >
          {loading ? "Creating..." : "Create Workspace"}
        </button>

      </div>
    </div>
  );
}