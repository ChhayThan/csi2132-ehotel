import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ApiError } from "../lib/api";
import {
  getCurrentUser,
  loginCustomer as loginCustomerRequest,
  loginEmployee as loginEmployeeRequest,
  registerCustomer as registerCustomerRequest,
} from "../lib/auth_api";

const AUTH_STORAGE_KEY = "ehotels.auth.token";

const AuthContext = createContext(null);

function readStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(AUTH_STORAGE_KEY);
}

function writeStoredToken(token) {
  if (typeof window === "undefined") {
    return;
  }

  if (token) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, token);
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => readStoredToken());
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(token ? "loading" : "anonymous");
  const [error, setError] = useState(null);

  const clearAuth = () => {
    writeStoredToken(null);
    setToken(null);
    setUser(null);
    setStatus("anonymous");
  };

  const applyToken = async (nextToken) => {
    writeStoredToken(nextToken);
    setToken(nextToken);
    setStatus("loading");
    setError(null);

    try {
      const currentUser = await getCurrentUser(nextToken);
      setUser(currentUser);
      setStatus("authenticated");
      return currentUser;
    } catch (requestError) {
      clearAuth();
      setError(requestError);
      throw requestError;
    }
  };

  const refreshMe = async () => {
    const activeToken = readStoredToken();

    if (!activeToken) {
      clearAuth();
      return null;
    }

    setStatus("loading");

    try {
      const currentUser = await getCurrentUser(activeToken);
      setToken(activeToken);
      setUser(currentUser);
      setStatus("authenticated");
      setError(null);
      return currentUser;
    } catch (requestError) {
      clearAuth();
      setError(requestError);
      throw requestError;
    }
  };

  const loginCustomer = async (payload) => {
    const response = await loginCustomerRequest(payload);
    const currentUser = await applyToken(response.access_token);
    return { token: response.access_token, user: currentUser };
  };

  const registerCustomer = async (payload) => {
    const response = await registerCustomerRequest(payload);
    const currentUser = await applyToken(response.access_token);
    return { token: response.access_token, user: currentUser };
  };

  const loginEmployee = async (payload) => {
    const response = await loginEmployeeRequest(payload);
    const currentUser = await applyToken(response.access_token);
    return { token: response.access_token, user: currentUser };
  };

  const logout = () => {
    setError(null);
    clearAuth();
  };

  useEffect(() => {
    const activeToken = readStoredToken();

    if (!activeToken) {
      setStatus("anonymous");
      return undefined;
    }

    const abortController = new AbortController();

    setStatus("loading");
    getCurrentUser(activeToken, abortController.signal)
      .then((currentUser) => {
        setToken(activeToken);
        setUser(currentUser);
        setStatus("authenticated");
        setError(null);
      })
      .catch((requestError) => {
        if (requestError?.name === "AbortError") {
          return;
        }

        clearAuth();
        setError(requestError);
      });

    return () => abortController.abort();
  }, []);

  const value = useMemo(() => {
    const isAuthenticated = status === "authenticated" && !!token && !!user;
    const isCustomer = isAuthenticated && user.actorType === "customer";
    const isEmployee = isAuthenticated && user.actorType === "employee";
    const isAdmin = isEmployee && user.role === "admin";
    const displayName =
      user ? `${user.firstName} ${user.lastName}`.trim() : "";

    return {
      token,
      user,
      status,
      error,
      isAuthenticated,
      isCustomer,
      isEmployee,
      isAdmin,
      displayName,
      loginCustomer,
      registerCustomer,
      loginEmployee,
      refreshMe,
      logout,
    };
  }, [token, user, status, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

export function isUnauthorizedError(error) {
  return error instanceof ApiError && error.status === 401;
}

