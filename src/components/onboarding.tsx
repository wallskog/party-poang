"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { User } from "@/lib/types";
import { PartyPopper, UserPlus, Users } from "lucide-react";
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
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-4">
      <Card className="w-full max-w-sm border-0 bg-white/10 backdrop-blur-xl shadow-2xl">
        <CardContent className="pt-8 pb-8 px-6 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-2">
              <PartyPopper className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Party Poäng
            </h1>
            <p className="text-white/70 text-sm">
              Skriv ditt namn för att börja samla poäng!
            </p>
          </div>

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
              className="h-12 bg-white/20 border-white/30 text-white placeholder:text-white/50 text-lg focus-visible:ring-white/50"
              autoFocus
            />
            <Button
              type="submit"
              disabled={!name.trim() || submitting}
              className="w-full h-12 text-lg font-semibold bg-white text-purple-700 hover:bg-white/90 cursor-pointer"
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
                className="w-full flex items-center justify-center gap-2 text-white/70 text-sm hover:text-white transition-colors cursor-pointer"
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
                      className="border-white/30 text-white bg-white/10 hover:bg-white/20 truncate cursor-pointer"
                    >
                      {u.name}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
