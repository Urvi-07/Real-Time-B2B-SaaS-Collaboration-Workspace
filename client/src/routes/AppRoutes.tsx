import { Routes, Route, Navigate } from "react-router-dom";
import { ReactNode } from "react";

import Dashboard from "../pages/Dashboard";
import WorkspacePage from "../pages/workspaces/WorkspacePage";
import CreateWorkspace from "../pages/workspaces/CreateWorkspacePage";

import Login from "../pages/Login";
import Register from "../pages/Register";

import AppLayout from "../layouts/AppLayout";

/* ---------------- PROTECTED ROUTE ---------------- */
type Props = {
  children: ReactNode;
};

function ProtectedRoute({ children }: Props) {
  const token = localStorage.getItem("token");

  const isAuth =
    token &&
    token !== "undefined" &&
    token !== "null";

  return isAuth ? <>{children}</> : <Navigate to="/login" replace />;
}

/* ---------------- ROUTES ---------------- */
export default function AppRoutes() {
  return (
    <Routes>

      {/* AUTH ROUTES */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* APP LAYOUT (SAAS STRUCTURE) */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >

        {/* DEFAULT REDIRECT */}
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* MAIN PAGES */}
        <Route path="dashboard" element={<Dashboard />} />

        <Route path="workspaces" element={<WorkspacePage />} />

        <Route path="workspaces/create" element={<CreateWorkspace />} />

      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />

    </Routes>
  );
}