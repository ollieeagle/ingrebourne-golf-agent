"use client";

import { AuthProvider, useAuth } from "@/lib/auth-context";
import { LoginScreen } from "@/components/login-screen";
import { AppShell } from "@/components/app-shell";

function AppContent() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <AppShell />;
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
