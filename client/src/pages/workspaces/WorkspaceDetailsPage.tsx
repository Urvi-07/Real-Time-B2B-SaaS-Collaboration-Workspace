import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";

export default function WorkspaceDetailsPage() {
  const { id } = useParams();
  const [workspace, setWorkspace] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/workspaces/${id}`);
        setWorkspace(res.data);
      } catch {
        setWorkspace(null);
      }
    };

    fetchData();
  }, [id]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "radial-gradient(circle at top, #0f172a, #020617)",
        fontFamily: "Arial",
        color: "white",
      }}
    >
      <div
        style={{
          width: "420px",
          background: "rgba(255,255,255,0.06)",
          borderRadius: "16px",
          padding: "25px",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(12px)",
        }}
      >
        <h2>Workspace Details</h2>

        {!workspace ? (
          <p style={{ color: "#94a3b8" }}>Loading...</p>
        ) : (
          <>
            <h3>{workspace.name}</h3>
            <p style={{ color: "#94a3b8" }}>
              {workspace.description || "No description"}
            </p>
          </>
        )}
      </div>
    </div>
  );
}