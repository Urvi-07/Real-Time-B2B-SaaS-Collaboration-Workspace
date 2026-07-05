import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ================= Navbar ================= */}

      <nav className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur border-b border-slate-800">

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-5 sm:px-6 py-4">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-xl">
              🚀
            </div>

            <div>

              <h1 className="text-xl font-bold">
                Orbit
              </h1>

              <p className="text-xs text-slate-400">
                Real-Time Collaboration
              </p>

            </div>

          </div>

          <div className="flex gap-3">

            <Link
              to="/login"
              className="px-4 py-2 border border-slate-700 rounded-lg hover:bg-slate-800 transition"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition"
            >
              Register
            </Link>

          </div>

        </div>

      </nav>

      {/* ================= Hero ================= */}

      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 md:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* Left */}

        <div>

          <span className="inline-block bg-blue-600/20 text-blue-400 px-4 py-2 rounded-full text-sm">
            🚀 Modern SaaS Collaboration Platform
          </span>

          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold leading-tight mt-6">

            Collaborate
            <span className="text-blue-500"> Smarter</span>
            <br />
            With Your Team

          </h1>

          <p className="text-slate-400 text-lg mt-6 leading-8">

            Orbit helps teams manage workspaces,
            communicate instantly using real-time chat,
            and collaborate securely from anywhere.

          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 px-7 py-3 rounded-xl font-semibold transition hover:scale-105"
            >
              Get Started
            </Link>

            <Link
              to="/login"
              className="border border-slate-700 hover:bg-slate-800 px-7 py-3 rounded-xl transition"
            >
              Login
            </Link>

          </div>

        </div>

        {/* Right */}

<div className="flex justify-center">

  <div className="relative w-full max-w-md">

    {/* Background Glow */}
    <div className="absolute -top-8 -left-8 w-48 h-48 bg-blue-600/20 blur-3xl rounded-full"></div>

    <div className="relative bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">

      {/* Header */}

      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">

        <div>

          <h3 className="font-bold text-xl">
            Development Team
          </h3>

          <p className="text-slate-400 text-sm">
            Workspace Dashboard
          </p>

        </div>

        <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">
          ● Active
        </span>

      </div>

      {/* Stats */}

      <div className="grid grid-cols-2 gap-4 p-6">

        <div className="bg-slate-800 rounded-xl p-4">

          <p className="text-slate-400 text-sm">
            Members
          </p>

          <h2 className="text-3xl font-bold mt-2">
            24
          </h2>

        </div>

        <div className="bg-slate-800 rounded-xl p-4">

          <p className="text-slate-400 text-sm">
            Workspaces
          </p>

          <h2 className="text-3xl font-bold mt-2 text-blue-400">
            12
          </h2>

        </div>

      </div>

      {/* Activity */}

      <div className="px-6 pb-6 space-y-3">

        <div className="flex justify-between bg-slate-800 rounded-xl p-4">

          <span>💬 Team Chat</span>

          <span className="text-green-400">
            Online
          </span>

        </div>

        <div className="flex justify-between bg-slate-800 rounded-xl p-4">

          <span>📂 Workspace</span>

          <span>Updated</span>

        </div>

        <div className="flex justify-between bg-slate-800 rounded-xl p-4">

          <span>⚡ Progress</span>

          <span className="text-blue-400">
            82%
          </span>

        </div>

        <div>

          <div className="flex justify-between mb-2">

            <span className="text-sm text-slate-400">
              Current Sprint
            </span>

            <span className="text-sm text-blue-400">
              82%
            </span>

          </div>

          <div className="h-2 rounded-full bg-slate-700 overflow-hidden">

            <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"></div>

          </div>

        </div>

      </div>

    </div>

  </div>

</div>

      </section>
            {/* ================= Features ================= */}

      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 md:py-20">

        <div className="text-center">

          <h2 className="text-3xl md:text-4xl font-bold">
            Everything You Need
          </h2>

          <p className="text-slate-400 mt-4 max-w-2xl mx-auto">
            Powerful features that help your team communicate,
            collaborate and manage projects efficiently.
          </p>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-14">

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500 hover:-translate-y-2 transition">

            <div className="text-4xl mb-4">💬</div>

            <h3 className="text-xl font-semibold">
              Real-Time Chat
            </h3>

            <p className="text-slate-400 mt-3">
              Instantly communicate with teammates using live messaging.
            </p>

          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500 hover:-translate-y-2 transition">

            <div className="text-4xl mb-4">📂</div>

            <h3 className="text-xl font-semibold">
              Workspaces
            </h3>

            <p className="text-slate-400 mt-3">
              Organize projects with dedicated collaborative workspaces.
            </p>

          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-green-500 hover:-translate-y-2 transition">

            <div className="text-4xl mb-4">👥</div>

            <h3 className="text-xl font-semibold">
              Team Collaboration
            </h3>

            <p className="text-slate-400 mt-3">
              Work together seamlessly from anywhere.
            </p>

          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-purple-500 hover:-translate-y-2 transition">

            <div className="text-4xl mb-4">🔒</div>

            <h3 className="text-xl font-semibold">
              Secure Access
            </h3>

            <p className="text-slate-400 mt-3">
              JWT authentication keeps your workspace protected.
            </p>

          </div>

        </div>

      </section>

      {/* ================= CTA ================= */}

      <section className="px-6 pb-20">

        <div className="max-w-6xl mx-auto bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-10 md:p-14 text-center">

          <h2 className="text-3xl md:text-5xl font-bold">
            Ready to Collaborate?
          </h2>

          <p className="mt-5 text-blue-100 text-lg">
            Join Orbit today and collaborate with your team in real time.
          </p>

          <Link
            to="/register"
            className="inline-block mt-8 bg-white text-blue-700 px-8 py-3 rounded-xl font-semibold hover:scale-105 transition"
          >
            Create Free Account
          </Link>

        </div>

      </section>

      {/* ================= Footer ================= */}

<footer className="border-t border-slate-800 bg-slate-950">

  <div className="max-w-7xl mx-auto px-6 py-10">

    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

      {/* Logo */}

      <div>

        <h3 className="text-2xl font-bold">
          🚀 Orbit
        </h3>

        <p className="text-slate-400 mt-3">
          Real-Time SaaS Collaboration Platform
        </p>

      </div>

      {/* Quick Links */}

      <div>

        <h3 className="text-xl font-semibold mb-4">
          Quick Links
        </h3>

        <ul className="space-y-3">

          <li>
            <Link
              to="/"
              className="text-slate-400 hover:text-blue-400 transition"
            >
              🏠 Home
            </Link>
          </li>

          <li>
            <Link
              to="/login"
              className="text-slate-400 hover:text-blue-400 transition"
            >
              🔑 Login
            </Link>
          </li>

          <li>
            <Link
              to="/register"
              className="text-slate-400 hover:text-blue-400 transition"
            >
              📝 Register
            </Link>
          </li>

          <li>
            <Link
              to="/dashboard"
              className="text-slate-400 hover:text-blue-400 transition"
            >
              📊 Dashboard
            </Link>
          </li>

          <li>
            <Link
              to="/workspaces"
              className="text-slate-400 hover:text-blue-400 transition"
            >
              📂 Workspaces
            </Link>
          </li>

        </ul>

      </div>

      {/* Contact */}

      <div>

        <h3 className="text-xl font-semibold mb-4">
          Contact
        </h3>

        <p className="text-slate-400">
          📧 support@orbit.com
        </p>

        <p className="text-slate-400 mt-2">
          🌐 www.orbit.com
        </p>

      </div>

    </div>

    <div className="border-t border-slate-800 mt-8 pt-6 text-center">

      <p className="text-slate-500 text-sm">
        © 2026 <span className="font-semibold text-white">Orbit</span>. All Rights Reserved.
      </p>

    </div>

  </div>

</footer>
</div>
  );
}
