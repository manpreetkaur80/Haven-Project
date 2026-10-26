
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LogoutButton() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();

        if (user?.role === "admin") {
            navigate("/admin/login", { replace: true });
        } else {
            navigate("/login", { replace: true });
        }
    };

    return (
        <button type="button" onClick={handleLogout}>
            Log out
        </button>
    );
}

export default LogoutButton;
