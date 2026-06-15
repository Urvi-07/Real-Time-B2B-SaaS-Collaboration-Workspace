import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <div className="p-8 space-y-8">
      <Login />
      <hr />
      <Register />
      <hr />
      <Dashboard />
    </div>
  );
}

export default App;