import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import AuthForm from "../components/AuthForm";

function SupervisorRegister() {
  const { user, setUser, redirectUrl, setRedirectUrl } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  if (user) {
    navigate("/", { replace: true });
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, isSupervisor: true }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      return;
    }

    setUser(data.user);
    const destination = redirectUrl || "/";
    setRedirectUrl("/");
    navigate(destination);
  }

  return (
    <AuthForm
      title="Create supervisor account"
      submitLabel="Register as supervisor"
      accentLabel="Supervisor access"
      description="Create an account with inventory management permissions."
      fields={[
        { id: "username", label: "Username", type: "text" },
        { id: "email", label: "Email", type: "email" },
        { id: "password", label: "Password", type: "password" },
      ]}
      values={{ username, email, password }}
      setValue={(field, value) => {
        if (field === "username") setUsername(value);
        if (field === "email") setEmail(value);
        if (field === "password") setPassword(value);
      }}
      error={error}
      onSubmit={handleSubmit}
      footerText="Already have a supervisor account?"
      footerLinkTo="/login"
      footerLinkLabel="Login here"
    />
  );
}

export default SupervisorRegister;