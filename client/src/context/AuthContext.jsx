import { createContext, useState, useContext, useEffect } from "react";
import apiClient, { authAPI } from "../services/apiClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(false);

  // login expects (token, user)
  const login = (authToken, userData) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("token", authToken);
    // Ensure axios has the Authorization header for subsequent requests
    if (authToken) {
      apiClient.defaults.headers.common.Authorization = `Bearer ${authToken}`;
    }
  };

  // load current user when token exists
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) return;
    let mounted = true;
    (async () => {
      try {
        // ensure axios has header when loading on refresh
        apiClient.defaults.headers.common.Authorization = `Bearer ${t}`;
        const { data } = await authAPI.me();
        if (mounted) {
          const userData = data.user;
          // Ensure _id exists for comparison
          if (!userData._id && userData.id) {
            userData._id = userData.id;
          }
          setUser(userData);
        }
      } catch (err) {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    // remove axios auth header
    delete apiClient.defaults.headers.common.Authorization;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
