import { Routes, Route } from "react-router";
import { Navigate } from "react-router";
import { useAuth } from "./hooks/useAuth";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SupervisorRegister from "./pages/SupervisorRegister";
import InventoryList from "./pages/InventoryList";
import InventoryDetail from "./pages/InventoryDetail";
import InventoryFormPage from "./pages/InventoryFormPage";
import TimeTracking from "./pages/TimeTracking";
import TaskManagement from "./pages/TaskManagement";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import ProjectFormPage from "./pages/ProjectFormPage";

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/inventory" element={<InventoryList />} />
          <Route path="/inventory/new" element={<InventoryFormPage />} />
          <Route path="/inventory/:id" element={<InventoryDetail />} />
          <Route path="/time" element={<TimeTracking />} />
          <Route path="/tasks" element={<TaskManagement />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/new" element={<ProjectFormPage />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/supervisor-login" element={<Navigate to="/login" replace />} />
          <Route path="/supervisor-register" element={<SupervisorRegister />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
