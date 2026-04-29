import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

function Navbar() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Everything Manage</Link>
      </div>
      <div className="navbar-links">
        {user ? (
          <>
          <Link to="/">Home</Link>
          <Link to="/inventory">Inventory</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/time">Time</Link>
            {user.isSupervisor && <Link to="/tasks">Tasks</Link>}
            <span className="navbar-user">Hi, {user.username}</span>
            <button onClick={handleLogout} className="btn btn-logout">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <Link to="/supervisor-register">Supervisor Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
