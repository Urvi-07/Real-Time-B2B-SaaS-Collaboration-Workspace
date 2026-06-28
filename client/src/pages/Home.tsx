import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-slate-800">

        <div className="flex items-center gap-3">

          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-xl font-bold shadow-lg">
            🚀
          </div>

          <div>
            <h1 className="text-xl font-bold">
              Team Workspace
            </h1>

            <p className="text-slate-400 text-sm">
              Real-Time Collaboration Platform
            </p>
          </div>

        </div>

        <div className="flex gap-4">

          <Link
            to="/login"
            className="px-5 py-2 border border-slate-700 rounded-lg hover:bg-slate-800 transition"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="px-5 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
          >
            Register
          </Link>

        </div>

      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-8 py-24 grid lg:grid-cols-2 gap-16 items-center">

        <div>

          <span className="bg-blue-900/40 text-blue-300 px-4 py-2 rounded-full text-sm">
            🚀 Collaborate Better, Together
          </span>

          <h1 className="text-6xl font-extrabold leading-tight mt-8">
            Work Together
            <span className="text-blue-500"> Smarter</span>
            <br />
            Manage Every
            <br />
            Workspace Easily
          </h1>

          <p className="text-slate-400 text-lg leading-8 mt-8">
            Create collaborative workspaces, communicate instantly,
            organize projects, and keep your entire team connected
            from one secure platform.
          </p>

          <div className="flex gap-5 mt-10">

            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl font-semibold transition"
            >
              Get Started
            </Link>

            <Link
              to="/login"
              className="border border-slate-700 hover:bg-slate-900 px-8 py-4 rounded-xl transition"
            >
              Login
            </Link>

          </div>

        </div>

        {/* Right Card */}
        <div className="flex justify-center">

          <div className="relative">

            <div className="absolute w-80 h-80 bg-blue-600 rounded-full blur-[140px] opacity-30"></div>

            <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl w-[430px]">

              <div className="flex justify-between items-center mb-8">

                <h2 className="text-2xl font-bold">
                  Workspace Overview
                </h2>

                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                  Active
                </span>

              </div>

              <div className="space-y-5">

                <div className="bg-slate-800 p-4 rounded-xl flex justify-between">
                  <span>💬 Team Chat</span>
                  <span className="text-green-400">Online</span>
                </div>

                <div className="bg-slate-800 p-4 rounded-xl flex justify-between">
                  <span>📂 Workspaces</span>
                  <span>12</span>
                </div>

                <div className="bg-slate-800 p-4 rounded-xl flex justify-between">
                  <span>👥 Members</span>
                  <span>24</span>
                </div>

                <div className="bg-slate-800 p-4 rounded-xl flex justify-between">
                  <span>📅 Meetings</span>
                  <span>3 Today</span>
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* Features */}

      <section className="max-w-7xl mx-auto px-8 py-24">

        <div className="text-center mb-16">

          <h2 className="text-5xl font-bold">
            Everything You Need to Collaborate
          </h2>

          <p className="text-slate-400 mt-5 max-w-3xl mx-auto text-lg">
            Bring your team together with powerful collaboration
            features that make communication, organization,
            and productivity effortless.
          </p>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-blue-500 hover:-translate-y-2 transition duration-300">

            <div className="text-5xl mb-5">💬</div>

            <h3 className="text-2xl font-bold mb-4">
              Real-Time Chat
            </h3>

            <p className="text-slate-400 leading-7">
              Send and receive messages instantly to keep everyone connected.
            </p>

          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-blue-500 hover:-translate-y-2 transition duration-300">

            <div className="text-5xl mb-5">📂</div>

            <h3 className="text-2xl font-bold mb-4">
              Workspace Management
            </h3>

            <p className="text-slate-400 leading-7">
              Organize multiple projects with dedicated collaborative workspaces.
            </p>

          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-blue-500 hover:-translate-y-2 transition duration-300">

            <div className="text-5xl mb-5">👥</div>

            <h3 className="text-2xl font-bold mb-4">
              Team Collaboration
            </h3>

            <p className="text-slate-400 leading-7">
              Collaborate efficiently by working together in one shared environment.
            </p>

          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-blue-500 hover:-translate-y-2 transition duration-300">

            <div className="text-5xl mb-5">🔒</div>

            <h3 className="text-2xl font-bold mb-4">
              Secure Access
            </h3>

            <p className="text-slate-400 leading-7">
              Protect your workspace with secure authentication and controlled access.
            </p>

          </div>

        </div>

      </section>

      {/* CTA */}

      <section className="bg-blue-600 py-24">

        <div className="text-center">

          <h2 className="text-5xl font-bold mb-6">
            Ready to Start Collaborating?
          </h2>

          <p className="text-blue-100 text-xl mb-10">
            Join your team today and experience a smarter way to work together.
          </p>

          <Link
            to="/register"
            className="bg-white text-blue-700 px-10 py-4 rounded-xl font-bold hover:bg-slate-100 transition"
          >
            Create Free Account
          </Link>

        </div>

      </section>

      {/* Footer */}

      <footer className="border-t border-slate-800 py-10 text-center">

        <h3 className="text-lg font-semibold">
          Team Workspace
        </h3>

        <p className="text-slate-500 mt-2">
          Real-Time B2B SaaS Collaboration Platform
        </p>

        <p className="text-slate-600 text-sm mt-6">
          © 2026 Team Workspace. All Rights Reserved.
        </p>

      </footer>

    </div>
  );
}