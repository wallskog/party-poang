"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User, RankedUser } from "@/lib/types";
import { ArrowLeft, Crown, Loader2 } from "lucide-react";
import Link from "next/link";

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

  const maxScore = users.length > 0 ? users[0].score : 1;

  const BAR_COLORS = [
    "from-yellow-400 to-amber-500",
    "from-slate-300 to-slate-400",
    "from-amber-600 to-amber-700",
    "from-violet-500 to-purple-500",
    "from-pink-500 to-rose-500",
    "from-cyan-500 to-blue-500",
    "from-emerald-500 to-teal-500",
    "from-red-500 to-pink-500",
  ];

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#1a0533] via-[#0f0a1e] to-[#0a0612]">
      <div className="max-w-md mx-auto">
        <div className="sticky top-0 z-50 bg-white/5 backdrop-blur-xl border-b border-white/10">
          <div className="px-4 py-4 flex items-center gap-3">
            <Link
              href="/"
              className="p-2 -ml-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              <h1 className="text-lg font-bold text-white">Topplista</h1>
            </div>
            <span className="ml-auto text-sm text-white/40">
              {users.length} gäster
            </span>
          </div>
        </div>

        <div className="px-4 py-5">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-white/40 py-12">
              Inga gäster ännu. Var först att gå med!
            </p>
          ) : (
            <div className="space-y-2">
              {users.map((u) => {
                const isCurrentUser = u.id === currentUserId;
                const barWidth = maxScore > 0 ? Math.max((u.score / maxScore) * 100, 8) : 8;
                const colorIdx = (u.rank - 1) % BAR_COLORS.length;

                return (
                  <div
                    key={u.id}
                    className={`rounded-xl p-3 transition-colors ${
                      isCurrentUser
                        ? "bg-white/10 ring-1 ring-yellow-400/30"
                        : "bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 text-center flex-shrink-0">
                        {u.rank <= 3 ? (
                          <span className="text-base">
                            {["🥇", "🥈", "🥉"][u.rank - 1]}
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-white/40">
                            {u.rank}.
                          </span>
                        )}
                      </span>

                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-medium truncate ${isCurrentUser ? "text-yellow-300" : "text-white/80"}`}>
                            {u.name}
                            {isCurrentUser && " ⭐"}
                          </span>
                          <span className="text-sm font-bold text-white/60 ml-2 tabular-nums flex-shrink-0">
                            {u.score}p
                          </span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${BAR_COLORS[colorIdx]} transition-all duration-500`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
