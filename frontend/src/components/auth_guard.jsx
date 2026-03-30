import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/auth_context";

function getAuthenticatedHome(user) {
  if (!user) {
    return "/";
  }

  if (user.actorType === "employee") {
    return user.role === "admin" ? "/admin/manage-database" : "/employee/dashboard";
  }

  return "/";
}

function AuthGuard({
  children,
  guestOnly = false,
  allowedActorTypes,
  allowedRoles,
  redirectTo,
}) {
  const location = useLocation();
  const { status, isAuthenticated, user } = useAuth();

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb]">
        <p className="text-sm font-medium tracking-wide text-slate-500">Loading...</p>
      </main>
    );
  }

  if (guestOnly) {
    if (isAuthenticated) {
      return <Navigate to={getAuthenticatedHome(user)} replace />;
    }

    return children;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo ?? "/login"} replace state={{ from: location }} />;
  }

  if (allowedActorTypes && !allowedActorTypes.includes(user.actorType)) {
    return <Navigate to={getAuthenticatedHome(user)} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getAuthenticatedHome(user)} replace />;
  }

  return children;
}

export default AuthGuard;
