import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import AuthForm from "../components/AuthForm";

function Login() {
  const { user, setUser, redirectUrl, setRedirectUrl } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // If the user is already logged in, redirect them
  if (user) {
    navigate(redirectUrl || "/", { replace: true });
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      return;
    }

    setUser(data.user);

    // Redirect to the page they were trying to access, or home
    const destination = redirectUrl || "/";
    setRedirectUrl("/");
    navigate(destination);
  }

  return (
    <AuthForm
      title="Login"
      submitLabel="Login"
      accentLabel="Account access"
      description="Sign in to access your account."
      fields={[
        { id: "username", label: "Username", type: "text" },
        { id: "password", label: "Password", type: "password" },
      ]}
      values={{ username, password }}
      setValue={(field, value) => {
        if (field === "username") setUsername(value);
        if (field === "password") setPassword(value);
      }}
      error={error}
      onSubmit={handleSubmit}
      footerText="Need an account?"
      footerLinks={[
        { to: "/register", label: "Laborer register" },
        { to: "/supervisor-register", label: "Supervisor register" },
      ]}
    />
  );
}

export default Login;
