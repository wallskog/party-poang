"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User, RankedUser } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Crown, Loader2 } from "lucide-react";
import Link from "next/link";

const MEDAL_COLORS = ["text-yellow-400", "text-gray-300", "text-amber-600"];

export default function LeaderboardPage() {
  const [users, setUsers] = useState<RankedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedId = localStorage.getItem("party-poang-user-id");
    if (storedId) setCurrentUserId(storedId);

    const fetchUsers = async () => {
      const { data } = await supabase
        .from("users")
        .select("*")
        .order("score", { ascending: false });

      if (data) {
        setUsers(data.map((u: User, i: number) => ({ ...u, rank: i + 1 })));
      }
      setLoading(false);
    };

    fetchUsers();

    const channel = supabase
      .channel("leaderboard-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        () => fetchUsers()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-dvh bg-gradient-to-b from-violet-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      <div className="max-w-md mx-auto">
        <div className="sticky top-0 z-50 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg">
          <div className="px-4 py-4 flex items-center gap-3">
            <Link
              href="/"
              className="p-2 -ml-2 rounded-lg hover:bg-white/15 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5" />
              <h1 className="text-lg font-bold">Topplista</h1>
            </div>
            <span className="ml-auto text-sm text-white/70">
              {users.length} gäster
            </span>
          </div>
        </div>

        <div className="px-4 py-5">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              Inga gäster ännu. Var först att gå med!
            </p>
          ) : (
            <Card className="border-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm shadow-sm">
              <CardContent className="p-3">
                <div className="space-y-1">
                  {users.map((u) => (
                    <div
                      key={u.id}
                      className={`flex items-center gap-3 rounded-lg px-3 py-3 transition-colors ${
                        u.id === currentUserId
                          ? "bg-violet-100 dark:bg-violet-900/40 ring-1 ring-violet-300 dark:ring-violet-700"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <span
                        className={`font-bold text-sm w-8 text-center flex-shrink-0 ${
                          u.rank <= 3
                            ? MEDAL_COLORS[u.rank - 1]
                            : "text-muted-foreground"
                        }`}
                      >
                        {u.rank <= 3
                          ? ["🥇", "🥈", "🥉"][u.rank - 1]
                          : `${u.rank}.`}
                      </span>

                      <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center text-sm font-bold text-violet-600 dark:text-violet-300 flex-shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>

                      <span className="flex-1 text-sm font-medium truncate">
                        {u.name}
                        {u.id === currentUserId && (
                          <span className="text-violet-500 ml-1 text-xs">
                            (du)
                          </span>
                        )}
                      </span>

                      <span className="font-bold text-sm tabular-nums flex-shrink-0">
                        {u.score}p
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
