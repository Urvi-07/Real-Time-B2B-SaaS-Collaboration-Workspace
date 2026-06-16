import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (name && email && password) {
      localStorage.setItem("token", "demo-token");
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1220] relative overflow-hidden">

      <div className="absolute w-[400px] h-[400px] bg-pink-600 blur-[140px] top-[-100px] left-[-100px]" />
      <div className="absolute w-[400px] h-[400px] bg-blue-600 blur-[140px] bottom-[-100px] right-[-100px]" />

      <form
        onSubmit={handleRegister}
        className="relative z-10 w-[380px] p-8 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 text-white shadow-2xl"
      >
        <h2 className="text-3xl font-bold text-center mb-2">Create Account</h2>
        <p className="text-center text-gray-300 mb-6 text-sm">
          Join your workspace
        </p>

        <input
          className="w-full mb-3 p-3 rounded-lg bg-white/10 border border-white/20 outline-none"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full mb-3 p-3 rounded-lg bg-white/10 border border-white/20 outline-none"
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

        <button className="w-full py-3 rounded-lg bg-gradient-to-r from-pink-500 to-blue-600 font-semibold hover:scale-[1.02] transition">
          Register
        </button>

        <p className="text-center mt-4 text-sm text-gray-300">
          Already have account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-400 cursor-pointer"
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}