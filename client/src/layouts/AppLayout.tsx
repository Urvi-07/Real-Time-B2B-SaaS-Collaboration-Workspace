import { Outlet, useNavigate, useLocation } from "react-router-dom";

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="h-screen flex bg-gray-50">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r flex flex-col p-4">

        <h1 className="text-xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
          SaaS App
        </h1>

        {/* NAV BUTTONS */}
        <nav className="space-y-2">

          <button
            onClick={() => navigate("/dashboard")}
            className={`w-full text-left px-4 py-2 rounded-xl transition ${
              isActive("/dashboard")
                ? "bg-indigo-100 text-indigo-700 font-semibold"
                : "hover:bg-gray-100"
            }`}
          >
            📊 Dashboard
          </button>

          <button
            onClick={() => navigate("/workspaces")}
            className={`w-full text-left px-4 py-2 rounded-xl transition ${
              isActive("/workspaces")
                ? "bg-indigo-100 text-indigo-700 font-semibold"
                : "hover:bg-gray-100"
            }`}
          >
            🧩 Workspaces
          </button>

          <button
            onClick={() => navigate("/workspaces/create")}
            className="w-full text-left px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold shadow hover:scale-[1.02] transition"
          >
            + Create Workspace
          </button>

        </nav>

        {/* FOOTER */}
        <div className="mt-auto text-xs text-gray-400">
          v1 SaaS UI System
        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

    </div>
  );
}