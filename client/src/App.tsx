import { Routes, Route, Navigate } from "react-router-dom";
import { ReactNode, useEffect } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

import WorkspacePage from "./pages/workspaces/WorkspacePage";
import CreateWorkspace from "./pages/workspaces/CreateWorkspacePage";
import WorkspaceDetail from "./pages/workspaces/WorkspaceDetailsPage";
import ChatPage from "./pages/ChatPage";

import { socket } from "./socket/socket";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = localStorage.getItem("token");

  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token && !socket.connected) {
      socket.connect();
    }

    const handleConnect = () => {
      console.log("✅ Socket Connected:", socket.id);
    };

    const handleDisconnect = () => {
      console.log("❌ Socket Disconnected");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
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

      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />

      {/* Default */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Catch All */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}