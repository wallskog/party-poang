"use client";

import { useUser } from "@/hooks/use-user";
import { Onboarding } from "@/components/onboarding";
import { Dashboard } from "@/components/dashboard";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, loading, login, logout, setUser } = useUser();

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600">
        <Loader2 className="w-10 h-10 text-white animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Onboarding onLogin={login} />;
  }

  return (
    <Dashboard
      user={user}
      onLogout={logout}
      onUserUpdate={setUser}
    />
  );
}
