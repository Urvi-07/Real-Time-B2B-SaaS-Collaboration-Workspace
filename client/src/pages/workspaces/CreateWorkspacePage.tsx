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

      const payload = {
        name: name.trim(),
        description: description.trim(),
      };

      console.log("SENDING PAYLOAD:", payload);

      const res = await api.post("/workspaces", payload);

      console.log("CREATE RESPONSE:", res.data);

      if (res.data?.success) {
        alert("Workspace created successfully!");
        navigate("/dashboard");
      } else {
        alert(res.data?.message || "Failed to create workspace");
      }
    } catch (err: any) {
      console.log("FULL ERROR:", err);

      if (err.response) {
        console.log("STATUS:", err.response.status);
        console.log("ERROR DATA:", err.response.data);

        alert(
          typeof err.response.data === "object"
            ? JSON.stringify(err.response.data, null, 2)
            : err.response.data
        );
      } else {
        alert(err.message || "Workspace creation failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-[400px]">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Create Workspace
        </h1>

        <input
          className="w-full p-3 mb-3 rounded bg-slate-800 border border-slate-700 outline-none"
          placeholder="Workspace Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <textarea
          className="w-full p-3 mb-4 rounded bg-slate-800 border border-slate-700 outline-none"
          placeholder="Workspace Description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full bg-blue-600 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Workspace"}
        </button>
      </div>
    </div>
  );
}