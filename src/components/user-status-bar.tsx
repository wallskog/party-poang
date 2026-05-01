"use client";

import { User } from "@/lib/types";
import { Crown, LogOut } from "lucide-react";
import Link from "next/link";

interface UserStatusBarProps {
  user: User;
  rank: number;
  totalUsers: number;
  onLogout: () => void;
}

function ordinal(n: number): string {
  return `${n}:a`;
}

export function UserStatusBar({ user, rank, totalUsers, onLogout }: UserStatusBarProps) {
  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{user.name}</p>
            <p className="text-white/70 text-xs">
              Du ligger {ordinal(rank)} av {totalUsers}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-3xl font-black tabular-nums leading-none">
              {user.score}
            </p>
            <p className="text-[10px] text-white/60 uppercase tracking-wider">
              poäng
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <Link
              href="/leaderboard"
              className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors"
              title="Topplista"
            >
              <Crown className="w-4 h-4" />
            </Link>
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors cursor-pointer"
              title="Logga ut"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
