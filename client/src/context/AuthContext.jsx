
import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import { getCurrentUser } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(
        () => localStorage.getItem("haven-token")
    );
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        async function loadUser() {
            if (!token) {
                if (active) {
                    setUser(null);
                    setLoading(false);
                }
                return;
            }

            try {
                const currentUser = await getCurrentUser(token);

                if (active) {
                    setUser(currentUser);
                }
            } catch {
                localStorage.removeItem("haven-token");

                if (active) {
                    setToken(null);
                    setUser(null);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        setLoading(true);
        loadUser();

        return () => {
            active = false;
        };
    }, [token]);

    const login = (data) => {
        localStorage.setItem("haven-token", data.token);
        setUser(data.user);
        setToken(data.token);
    };

    const logout = () => {
        localStorage.removeItem("haven-token");
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider
            value={{ user, token, loading, login, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}
