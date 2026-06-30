import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden relative">

      {/* Background Glow */}

      <div className="absolute inset-0 overflow-hidden -z-10">

        <div className="absolute -top-52 -left-40 w-[450px] h-[450px] rounded-full bg-blue-600/20 blur-[150px] animate-pulse"></div>

        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-cyan-500/20 blur-[170px] animate-pulse"></div>

      </div>

      {/* ================= NAVBAR ================= */}

      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/70 border-b border-slate-800">

        <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-5">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-2xl shadow-xl shadow-blue-500/40">

              🚀

            </div>

            <div>

              <h1 className="text-2xl font-extrabold tracking-tight">
                CollabSpace
              </h1>

              <p className="text-slate-400 text-sm">
                Real-Time SaaS Collaboration Platform
              </p>

            </div>

          </div>

          <div className="flex items-center gap-4">

            <Link
              to="/login"
              className="px-6 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 transition duration-300"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-105 transition duration-300 shadow-lg shadow-blue-500/30"
            >
              Get Started
            </Link>

          </div>

        </div>

      </nav>

      {/* ================= HERO ================= */}

      <section className="max-w-7xl mx-auto px-8 py-24 grid lg:grid-cols-2 gap-20 items-center">

        {/* Left Side */}

        <div>

          <span className="inline-block px-5 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-300 font-medium">

            🚀 Next Generation Collaboration Platform

          </span>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mt-8">

            Work

            <br />

            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent">

              Faster.

            </span>

            <br />

            Collaborate

            <br />

            Better.

          </h1>

          <p className="text-slate-400 text-base md:text-lg leading-8 mt-8 max-w-2xl">

            CollabSpace helps teams create secure workspaces,
            communicate instantly with real-time chat,
            manage projects efficiently, and collaborate
            from anywhere.

          </p>

          <div className="flex gap-5 mt-12">

            <Link
              to="/register"
              className="bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-4 rounded-2xl font-semibold hover:scale-105 transition duration-300 shadow-xl shadow-blue-500/30"
            >
              Start Free →
            </Link>

            <Link
              to="/login"
              className="px-8 py-4 rounded-2xl border border-slate-700 hover:bg-slate-900 transition duration-300"
            >
              Login
            </Link>

          </div>

          {/* Statistics */}

          <div className="grid grid-cols-3 gap-8 mt-16">

            <div>

              <h2 className="text-4xl font-bold text-blue-400">

                99.9%

              </h2>

              <p className="text-slate-400 mt-2">

                Uptime

              </p>

            </div>

            <div>

              <h2 className="text-4xl font-bold text-cyan-400">

                Live

              </h2>

              <p className="text-slate-400 mt-2">

                Collaboration

              </p>

            </div>

            <div>

              <h2 className="text-4xl font-bold text-green-400">

                Secure

              </h2>

              <p className="text-slate-400 mt-2">

                Authentication

              </p>

            </div>

          </div>

        </div>
                {/* Right Side */}

        <div className="flex justify-center">

          <div className="relative">

            {/* Glow */}

            <div className="absolute inset-0 bg-blue-500/20 blur-[120px] rounded-full"></div>

            {/* Dashboard Card */}

            <div className="relative w-[480px] rounded-3xl border border-slate-700 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">

              {/* Top */}

              <div className="flex justify-between items-center mb-8">

                <div>

                  <h2 className="text-2xl font-bold">

                    Workspace Dashboard

                  </h2>

                  <p className="text-slate-400 text-sm mt-1">

                    Welcome back 👋

                  </p>

                </div>

                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-2xl shadow-lg">

                  🚀

                </div>

              </div>

              {/* Workspace */}

              <div className="bg-slate-900/70 rounded-2xl border border-slate-700 p-5 hover:border-blue-500 transition duration-300">

                <div className="flex justify-between items-center">

                  <div>

                    <h3 className="font-bold text-lg">

                      Product Team

                    </h3>

                    <p className="text-slate-400 text-sm">

                      Active Workspace

                    </p>

                  </div>

                  <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">

                    ● Live

                  </span>

                </div>

              </div>

              {/* Stats */}

              <div className="grid grid-cols-2 gap-4 mt-6">

                <div className="rounded-2xl bg-slate-900 p-5 border border-slate-800 hover:border-blue-500 transition">

                  <p className="text-slate-400 text-sm">

                    Team Members

                  </p>

                  <h2 className="text-4xl font-bold mt-2">

                    24

                  </h2>

                </div>

                <div className="rounded-2xl bg-slate-900 p-5 border border-slate-800 hover:border-blue-500 transition">

                  <p className="text-slate-400 text-sm">

                    Workspaces

                  </p>

                  <h2 className="text-4xl font-bold mt-2">

                    12

                  </h2>

                </div>

              </div>

              {/* Activity */}

              <div className="mt-8">

                <h3 className="font-semibold mb-4">

                  Live Activity

                </h3>

                <div className="space-y-3">

                  <div className="flex items-center justify-between bg-slate-900 rounded-xl p-4">

                    <div>

                      <p>💬 Team Chat</p>

                      <span className="text-slate-400 text-sm">

                        Messages syncing instantly

                      </span>

                    </div>

                    <span className="text-green-400 font-semibold">

                      Online

                    </span>

                  </div>

                  <div className="flex items-center justify-between bg-slate-900 rounded-xl p-4">

                    <div>

                      <p>📂 Workspace Updates</p>

                      <span className="text-slate-400 text-sm">

                        Shared resources

                      </span>

                    </div>

                    <span className="text-blue-400">

                      15 Files

                    </span>

                  </div>

                  <div className="flex items-center justify-between bg-slate-900 rounded-xl p-4">

                    <div>

                      <p>👥 Active Users</p>

                      <span className="text-slate-400 text-sm">

                        Collaborating now

                      </span>

                    </div>

                    <span className="text-cyan-400">

                      8 Online

                    </span>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>
            {/* ================= FEATURES ================= */}

      <section className="max-w-7xl mx-auto px-8 py-28">

        <div className="text-center mb-20">

          <span className="text-blue-400 font-semibold uppercase tracking-widest">
            FEATURES
          </span>

          <h2 className="text-3xl md:text-4xl font-black">
            Everything Your Team
            <span className="text-blue-500"> Needs</span>
          </h2>

          <p className="text-slate-400 text-lg max-w-3xl mx-auto mt-6 leading-8">
            CollabSpace combines messaging, workspace management,
            authentication and collaboration into one modern SaaS platform
            built for productive teams.
          </p>

        </div>

        <div className="grid lg:grid-cols-2 gap-8">

          {/* Card 1 */}

          <div className="group rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-8 hover:border-blue-500 hover:-translate-y-2 transition duration-500">

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-3xl shadow-lg">

              💬

            </div>

            <h3 className="text-xl md:text-2xl font-bold mt-6">
              Real-Time Messaging
            </h3>

            <p className="text-slate-400 mt-5 leading-8">
              Chat instantly with teammates using Socket.IO powered
              communication. Messages appear in real time without refreshing
              the page.
            </p>

          </div>

          {/* Card 2 */}

          <div className="group rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-8 hover:border-cyan-500 hover:-translate-y-2 transition duration-500">

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-3xl shadow-lg">

              📂

            </div>

            <h3 className="text-3xl font-bold mt-8">
              Smart Workspaces
            </h3>

            <p className="text-slate-400 mt-5 leading-8">
              Create dedicated workspaces for every project. Organize your
              team, discussions and resources in one secure place.
            </p>

          </div>

          {/* Card 3 */}

          <div className="group rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-8 hover:border-green-500 hover:-translate-y-2 transition duration-500">

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-3xl shadow-lg">

              👥

            </div>

            <h3 className="text-3xl font-bold mt-8">
              Team Collaboration
            </h3>

            <p className="text-slate-400 mt-5 leading-8">
              Invite teammates, collaborate in shared workspaces and keep
              everyone synchronized through live updates.
            </p>

          </div>

          {/* Card 4 */}

          <div className="group rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-8 hover:border-purple-500 hover:-translate-y-2 transition duration-500">

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl shadow-lg">

              🔐

            </div>

            <h3 className="text-3xl font-bold mt-8">
              Secure Authentication
            </h3>

            <p className="text-slate-400 mt-5 leading-8">
              JWT authentication ensures only authorized users can access
              workspaces and communicate securely.
            </p>

          </div>

        </div>

      </section>
            {/* ================= WHY CHOOSE US ================= */}

      <section className="max-w-7xl mx-auto px-8 py-28">

        <div className="grid lg:grid-cols-2 gap-20 items-center">

          {/* Left */}

          <div>

            <span className="text-blue-400 font-semibold uppercase tracking-widest">
              WHY COLLABSPACE
            </span>

           <h2 className="text-3xl md:text-4xl font-black mt-6">

              Everything Your Team
              <br />
              Needs In One Place.

            </h2>

            <p className="text-slate-400 text-lg leading-8 mt-8">

              From workspace management to real-time communication,
              CollabSpace provides a seamless collaboration experience
              with secure authentication, instant messaging, and
              modern cloud architecture.

            </p>

            <div className="space-y-6 mt-10">

              <div className="flex gap-5">

                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-xl">

                  ✓

                </div>

                <div>

                  <h3 className="font-bold text-xl">

                    Lightning Fast Collaboration

                  </h3>

                  <p className="text-slate-400 mt-2">

                    Powered by Socket.IO for instant communication.

                  </p>

                </div>

              </div>

              <div className="flex gap-5">

                <div className="w-12 h-12 rounded-xl bg-cyan-600 flex items-center justify-center text-xl">

                  ✓

                </div>

                <div>

                  <h3 className="font-bold text-xl">

                    Secure Workspace Access

                  </h3>

                  <p className="text-slate-400 mt-2">

                    JWT authentication protects every workspace.

                  </p>

                </div>

              </div>

              <div className="flex gap-5">

                <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center text-xl">

                  ✓

                </div>

                <div>

                  <h3 className="font-bold text-xl">

                    Modern User Experience

                  </h3>

                  <p className="text-slate-400 mt-2">

                    Beautiful interface built with React & Tailwind CSS.

                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* Right */}

          <div className="grid grid-cols-2 gap-6">

            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-10 hover:border-blue-500 hover:-translate-y-2 transition duration-300">

              <h2 className="text-5xl font-black text-blue-400">

                100%

              </h2>

              <p className="text-slate-400 mt-3">

                Secure Authentication

              </p>

            </div>

            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-10 hover:border-cyan-500 hover:-translate-y-2 transition duration-300">

              <h2 className="text-5xl font-black text-cyan-400">

                24/7

              </h2>

              <p className="text-slate-400 mt-3">

                Real-Time Messaging

              </p>

            </div>

            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-10 hover:border-green-500 hover:-translate-y-2 transition duration-300">

              <h2 className="text-5xl font-black text-green-400">

                Live

              </h2>

              <p className="text-slate-400 mt-3">

                Socket.IO Updates

              </p>

            </div>

            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-10 hover:border-purple-500 hover:-translate-y-2 transition duration-300">

              <h2 className="text-5xl font-black text-purple-400">

                Easy

              </h2>

              <p className="text-slate-400 mt-3">

                Workspace Management

              </p>

            </div>

          </div>

        </div>

      </section>
            {/* ================= CTA ================= */}

      <section className="relative overflow-hidden py-28">

        {/* Background Glow */}

        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-700 opacity-95"></div>

        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-white/10 blur-3xl"></div>

        <div className="relative max-w-6xl mx-auto px-8 text-center">

          <span className="bg-white/20 px-5 py-2 rounded-full text-sm font-semibold tracking-widest uppercase">

            Start Today

          </span>

          <h2 className="text-4xl md:text-5xl font-black mt-8">

            Collaborate Smarter
            <br />
            with <span className="text-white">CollabSpace</span>

          </h2>

          <p className="text-blue-100 text-xl max-w-3xl mx-auto mt-8 leading-9">

            Create secure workspaces, communicate instantly, and
            collaborate with your team using a modern real-time
            collaboration platform.

          </p>

          <div className="flex flex-wrap justify-center gap-6 mt-12">

            <Link
              to="/register"
              className="bg-white text-blue-700 px-10 py-4 rounded-2xl font-bold hover:scale-105 transition duration-300 shadow-xl"
            >
              🚀 Get Started Free
            </Link>

            <Link
              to="/login"
              className="border border-white px-10 py-4 rounded-2xl font-semibold hover:bg-white hover:text-blue-700 transition duration-300"
            >
              Login
            </Link>

          </div>

        </div>

      </section>

      {/* ================= FOOTER ================= */}

      <footer className="border-t border-slate-800 bg-slate-950">

        <div className="max-w-7xl mx-auto px-8 py-16">

          <div className="grid md:grid-cols-4 gap-12">

            {/* Logo */}

            <div>

              <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-2xl shadow-lg">

                  🚀

                </div>

                <div>

                  <h2 className="text-xl font-black">

                    CollabSpace

                  </h2>

                  <p className="text-slate-400 text-sm">

                    Real-Time SaaS Collaboration

                  </p>

                </div>

              </div>

              <p className="text-slate-400 mt-6 leading-7">

                A modern collaboration platform for teams to manage
                workspaces, communicate instantly, and work together
                securely.

              </p>

            </div>

            {/* Product */}

            <div>

              <h3 className="text-xl font-bold mb-5">

                Product

              </h3>

              <ul className="space-y-3 text-slate-400">

                <li className="hover:text-white transition cursor-pointer">
                  Workspaces
                </li>

                <li className="hover:text-white transition cursor-pointer">
                  Team Chat
                </li>

                <li className="hover:text-white transition cursor-pointer">
                  Authentication
                </li>

                <li className="hover:text-white transition cursor-pointer">
                  Dashboard
                </li>

              </ul>

            </div>

            {/* Technologies */}

            <div>

              <h3 className="text-xl font-bold mb-5">

                Technologies

              </h3>

              <ul className="space-y-3 text-slate-400">

                <li>⚛ React</li>

                <li>🎨 Tailwind CSS</li>

                <li>🟢 Node.js</li>

                <li>⚡ Socket.IO</li>

                <li>🍃 MongoDB</li>

              </ul>

            </div>

            {/* Contact */}

            <div>

              <h3 className="text-xl font-bold mb-5">

                Connect

              </h3>

              <div className="flex gap-4 text-3xl">

                <span className="hover:scale-110 transition cursor-pointer">
                  🌐
                </span>

                <span className="hover:scale-110 transition cursor-pointer">
                  💼
                </span>

                <span className="hover:scale-110 transition cursor-pointer">
                  📧
                </span>

                <span className="hover:scale-110 transition cursor-pointer">
                  🐙
                </span>

              </div>

            </div>

          </div>

          <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center">

            <p className="text-slate-500">

              © 2026 CollabSpace. All Rights Reserved.

            </p>

            <p className="text-slate-500 mt-4 md:mt-0">

              Built with ❤️ using React • Node.js • Socket.IO • MongoDB

            </p>

          </div>

        </div>

      </footer>
    </div>
  );
}
  
