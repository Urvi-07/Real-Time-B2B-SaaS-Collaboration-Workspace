import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // demo auth
    if (email && password) {
      localStorage.setItem("token", "demo-token");
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1220] relative overflow-hidden">

      {/* background glow */}
      <div className="absolute w-[400px] h-[400px] bg-blue-600 blur-[140px] top-[-100px] left-[-100px]" />
      <div className="absolute w-[400px] h-[400px] bg-purple-600 blur-[140px] bottom-[-100px] right-[-100px]" />

      <form
        onSubmit={handleLogin}
        className="relative z-10 w-[380px] p-8 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 text-white shadow-2xl"
      >
        <h2 className="text-3xl font-bold text-center mb-2">Welcome Back</h2>
        <p className="text-center text-gray-300 mb-6 text-sm">
          Login to your workspace
        </p>

        <input
          className="w-full mb-4 p-3 rounded-lg bg-white/10 border border-white/20 outline-none"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full mb-6 p-3 rounded-lg bg-white/10 border border-white/20 outline-none"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 font-semibold hover:scale-[1.02] transition">
          Login
        </button>

        <p className="text-center mt-4 text-sm text-gray-300">
          New here?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-blue-400 cursor-pointer"
          >
            Create account
          </span>
        </p>
      </form>
    </div>
  );
}