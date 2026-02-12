import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Users from './pages/Users';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';


import Register from './pages/Register';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" />} />
        <Route path="/users" element={<Users />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:projectId/tasks" element={<Tasks />} />

      </Routes>
    </BrowserRouter>
  );
};

export default App;
