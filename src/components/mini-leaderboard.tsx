"use client";

import { RankedUser } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface MiniLeaderboardProps {
  topUsers: RankedUser[];
  currentUserId: string;
  currentUserRank: number;
  currentUser: RankedUser | null;
}

const MEDAL_COLORS = ["text-yellow-400", "text-gray-300", "text-amber-600"];

export function MiniLeaderboard({
  topUsers,
  currentUserId,
  currentUserRank,
  currentUser,
}: MiniLeaderboardProps) {
  const showCurrentAtBottom =
    currentUser && currentUserRank > 5;

  return (
    <Card className="border-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <h2 className="font-bold text-sm uppercase tracking-wide text-muted-foreground">
            Topplista
          </h2>
        </div>

        <div className="space-y-1.5">
          {topUsers.map((u) => (
            <div
              key={u.id}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                u.id === currentUserId
                  ? "bg-violet-100 dark:bg-violet-900/40 ring-1 ring-violet-300 dark:ring-violet-700"
                  : "hover:bg-muted/50"
              }`}
            >
              <span
                className={`font-bold text-sm w-6 text-center ${
                  u.rank <= 3 ? MEDAL_COLORS[u.rank - 1] : "text-muted-foreground"
                }`}
              >
                {u.rank <= 3
                  ? ["🥇", "🥈", "🥉"][u.rank - 1]
                  : `${u.rank}.`}
              </span>
              <span className="flex-1 text-sm font-medium truncate">
                {u.name}
                {u.id === currentUserId && (
                  <span className="text-violet-500 ml-1 text-xs">(du)</span>
                )}
              </span>
              <span className="font-bold text-sm tabular-nums">
                {u.score}p
              </span>
            </div>
          ))}

          {showCurrentAtBottom && currentUser && (
            <>
              <div className="flex items-center justify-center gap-1 py-1 text-muted-foreground">
                <span className="text-xs">•••</span>
              </div>
              <div className="flex items-center gap-3 rounded-lg px-3 py-2 bg-violet-100 dark:bg-violet-900/40 ring-1 ring-violet-300 dark:ring-violet-700">
                <span className="font-bold text-sm w-6 text-center text-muted-foreground">
                  {currentUser.rank}.
                </span>
                <span className="flex-1 text-sm font-medium truncate">
                  {currentUser.name}
                  <span className="text-violet-500 ml-1 text-xs">(du)</span>
                </span>
                <span className="font-bold text-sm tabular-nums">
                  {currentUser.score}p
                </span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
