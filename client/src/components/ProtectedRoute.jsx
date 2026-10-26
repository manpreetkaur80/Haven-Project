
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, adminOnly = false }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <main className="auth-page">Loading HAVEN...</main>;
    }

    if (!user) {
        return (
            <Navigate
                to={adminOnly ? "/admin/login" : "/login"}
                state={{ from: location.pathname }}
                replace
            />
        );
    }

    if (adminOnly && user.role !== "admin") {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default ProtectedRoute;
