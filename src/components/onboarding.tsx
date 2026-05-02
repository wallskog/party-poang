"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { User } from "@/lib/types";
import { UserPlus, Users } from "lucide-react";
import { toast } from "sonner";

interface OnboardingProps {
  onLogin: (name: string) => Promise<User | null>;
}

export function Onboarding({ onLogin }: OnboardingProps) {
  const [name, setName] = useState("");
  const [existingUsers, setExistingUsers] = useState<User[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showExisting, setShowExisting] = useState(false);

  useEffect(() => {
    supabase
      .from("users")
      .select("*")
      .order("name")
      .then(({ data }) => {
        if (data) setExistingUsers(data);
      });
  }, []);

  const handleSubmit = async (selectedName?: string) => {
    const finalName = selectedName || name;
    if (!finalName.trim()) return;
    setSubmitting(true);
    try {
      await onLogin(finalName);
    } catch (err) {
      toast.error("Kunde inte logga in", {
        description: err instanceof Error ? err.message : "Kolla att Supabase-tabellerna är skapade.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-b from-[#1a0533] via-[#0f0a1e] to-[#0a0612] p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-3">
          <p className="text-5xl">🎉</p>
          <h1 className="text-4xl font-black text-white tracking-tight">
            TUAS BIRTHDAY
          </h1>
          <p className="text-white/50 text-sm">
            Skriv ditt namn för att börja samla poäng!
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="space-y-3"
          >
            <Input
              placeholder="Ditt namn..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 bg-white/10 border-white/10 text-white placeholder:text-white/30 text-lg focus-visible:ring-violet-500/50 rounded-xl"
              autoFocus
            />
            <Button
              type="submit"
              disabled={!name.trim() || submitting}
              className="w-full h-12 text-lg font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 rounded-xl border-0 cursor-pointer"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              {submitting ? "Laddar..." : "Gå med"}
            </Button>
          </form>

          {existingUsers.length > 0 && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowExisting(!showExisting)}
                className="w-full flex items-center justify-center gap-2 text-white/40 text-sm hover:text-white/70 transition-colors cursor-pointer"
              >
                <Users className="w-4 h-4" />
                {showExisting
                  ? "Dölj befintliga gäster"
                  : `Välj bland ${existingUsers.length} gäster`}
              </button>

              {showExisting && (
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {existingUsers.map((u) => (
                    <Button
                      key={u.id}
                      variant="outline"
                      size="sm"
                      disabled={submitting}
                      onClick={() => handleSubmit(u.name)}
                      className="border-white/10 text-white bg-white/5 hover:bg-white/15 truncate cursor-pointer rounded-lg"
                    >
                      {u.name}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
