"use client";

import { RankedUser } from "@/lib/types";
import { Trophy } from "lucide-react";
import Link from "next/link";

interface MiniLeaderboardProps {
  topUsers: RankedUser[];
  currentUserId: string;
  currentUserRank: number;
  currentUser: RankedUser | null;
}

const BAR_COLORS = [
  "from-yellow-400 to-amber-500",
  "from-slate-300 to-slate-400",
  "from-amber-600 to-amber-700",
  "from-violet-500 to-purple-500",
  "from-pink-500 to-rose-500",
];

export function MiniLeaderboard({
  topUsers,
  currentUserId,
  currentUserRank,
  currentUser,
}: MiniLeaderboardProps) {
  const showCurrentAtBottom = currentUser && currentUserRank > 5;
  const maxScore = topUsers.length > 0 ? topUsers[0].score : 1;

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <h2 className="font-bold text-sm text-white">Topp 5</h2>
        </div>
        <Link
          href="/leaderboard"
          className="text-xs text-white/50 hover:text-white/80 transition-colors"
        >
          Se hela listan →
        </Link>
      </div>

      <div className="space-y-2.5">
        {topUsers.map((u, i) => {
          const barWidth = maxScore > 0 ? Math.max((u.score / maxScore) * 100, 8) : 8;
          const isCurrentUser = u.id === currentUserId;

          return (
            <div key={u.id} className="flex items-center gap-2.5">
              <span className="w-5 text-center text-xs font-bold text-white/50 flex-shrink-0">
                {u.rank <= 3 ? ["🥇", "🥈", "🥉"][u.rank - 1] : `${u.rank}.`}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-xs font-medium truncate ${isCurrentUser ? "text-yellow-300" : "text-white/80"}`}>
                    {u.name}
                    {isCurrentUser && " ⭐"}
                  </span>
                  <span className="text-xs font-bold text-white/60 ml-2 tabular-nums flex-shrink-0">
                    {u.score}p
                  </span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${BAR_COLORS[i] || BAR_COLORS[3]} transition-all duration-500`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}

        {showCurrentAtBottom && currentUser && (
          <>
            <div className="flex items-center justify-center py-0.5">
              <span className="text-white/20 text-xs">• • •</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-5 text-center text-xs font-bold text-white/50 flex-shrink-0">
                {currentUser.rank}.
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-medium truncate text-yellow-300">
                    {currentUser.name} ⭐
                  </span>
                  <span className="text-xs font-bold text-white/60 ml-2 tabular-nums flex-shrink-0">
                    {currentUser.score}p
                  </span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-500"
                    style={{ width: `${maxScore > 0 ? Math.max((currentUser.score / maxScore) * 100, 8) : 8}%` }}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
