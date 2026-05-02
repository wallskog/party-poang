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
    <div className="sticky top-0 z-50 bg-white/5 backdrop-blur-xl border-b border-white/10">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-2xl">🎉</span>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Party Poäng
            </h1>
          </div>
          <div className="flex items-center gap-1.5">
            <Link
              href="/leaderboard"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
              title="Topplista"
            >
              <Crown className="w-4 h-4" />
            </Link>
            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white cursor-pointer"
              title="Logga ut"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
          <p className="text-white/60 text-xs mb-1">
            Hej, {user.name}!
          </p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider">Dina poäng</p>
              <p className="text-4xl font-black text-white tabular-nums leading-none mt-1">
                {user.score} <span className="text-lg font-bold text-white/50">p</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/40 uppercase tracking-wider">Din placering</p>
              <p className="text-4xl font-black text-white tabular-nums leading-none mt-1">
                {ordinal(rank)}
              </p>
              <p className="text-[10px] text-white/40">av {totalUsers}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
