import { Routes, Route, Navigate } from "react-router-dom";
import StarryRecruiter from "./StarryRecruiter";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ProtectedRoute from "./auth/ProtectedRoute";
import LogoutButton from "./auth/LogoutButton";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <LogoutButton />
            <StarryRecruiter />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
