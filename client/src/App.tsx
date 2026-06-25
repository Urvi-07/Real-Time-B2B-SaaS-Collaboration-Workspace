import { Routes, Route, Navigate } from "react-router-dom";
import { ReactNode, useEffect } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

import WorkspacePage from "./pages/workspaces/WorkspacePage";
import CreateWorkspace from "./pages/workspaces/CreateWorkspacePage";
import WorkspaceDetail from "./pages/workspaces/WorkspaceDetailsPage";

import { socket } from "./socket";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = localStorage.getItem("token");

  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      socket.connect();

      socket.on("connect", () => {
        console.log("✅ Socket Connected:", socket.id);
      });

      socket.on("disconnect", () => {
        console.log("❌ Socket Disconnected");
      });
    }

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/workspaces"
        element={
          <ProtectedRoute>
            <WorkspacePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/workspaces/create"
        element={
          <ProtectedRoute>
            <CreateWorkspace />
          </ProtectedRoute>
        }
      />

      <Route
        path="/workspaces/:id"
        element={
          <ProtectedRoute>
            <WorkspaceDetail />
          </ProtectedRoute>
        }
      />

      {/* Default */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}