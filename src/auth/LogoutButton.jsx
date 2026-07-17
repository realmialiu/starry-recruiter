import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <button
      className="icon-btn"
      onClick={handleLogout}
      title="Log out"
      style={{ position: "fixed", top: 14, right: 14, zIndex: 100 }}
    >
      <LogOut size={16} />
    </button>
  );
}
