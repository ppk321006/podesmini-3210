import React from "react";
import { useAuth } from "@/context/auth-context";
import { redirect } from "react-router-dom";

export default function Index() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return redirect("/login");
  }

  if (user?.role === 'admin') {
    return redirect("/dashboard");
  }

  if (user?.role === 'pml') {
    return redirect("/progress-ubinan");
  }

  if (user?.role === 'ppl') {
    return redirect("/progress-ubinan");
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to the dashboard!</p>
    </div>
  );
}
