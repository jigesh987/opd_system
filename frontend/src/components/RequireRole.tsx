import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function RequireRole({ role, children }: { role: string; children: ReactNode }) {
  const { authUser } = useApp();
  if (!authUser) return <Navigate to="/login" replace />;
  if (authUser.role !== role) return <Navigate to="/" replace />;
  return children;
}
