import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#0b1220] text-white flex">

      {/* Sidebar */}
      <div className="w-64 bg-white/5 border-r border-white/10 p-6">
        <h1 className="text-xl font-bold mb-8">Workspace</h1>

        <ul className="space-y-4 text-gray-300">
          <li className="hover:text-white cursor-pointer">🏠 Dashboard</li>
          <li className="hover:text-white cursor-pointer">📁 Projects</li>
          <li className="hover:text-white cursor-pointer">💬 Chat</li>
          <li className="hover:text-white cursor-pointer">⚙️ Settings</li>
        </ul>

        <button
          onClick={logout}
          className="mt-10 w-full py-2 rounded-lg bg-red-500/20 hover:bg-red-500/40"
        >
          Logout
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8">

        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        <div className="grid grid-cols-3 gap-6">

          <div className="p-5 rounded-xl bg-white/5 border border-white/10">
            📁 Projects
          </div>

          <div className="p-5 rounded-xl bg-white/5 border border-white/10">
            💬 Messages
          </div>

          <div className="p-5 rounded-xl bg-white/5 border border-white/10">
            ⚡ Activity
          </div>

        </div>

      </div>
    </div>
  );
}