"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { User, RankedUser } from "@/lib/types";
import { ONE_TIME_TASK_NAMES } from "@/lib/tasks";
import { UserStatusBar } from "./user-status-bar";
import { MiniLeaderboard } from "./mini-leaderboard";
import { ActionGrid } from "./action-grid";

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onUserUpdate: (user: User) => void;
}

export function Dashboard({ user, onLogout, onUserUpdate }: DashboardProps) {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [completedOneTimeTasks, setCompletedOneTimeTasks] = useState<Set<string>>(
    new Set()
  );
  const userRef = useRef(user);
  userRef.current = user;

  const fetchLeaderboard = useCallback(async () => {
    const { data } = await supabase
      .from("users")
      .select("*")
      .order("score", { ascending: false });
    if (data) setAllUsers(data);
  }, []);

  const fetchCompletedTasks = useCallback(async () => {
    const { data } = await supabase
      .from("actions")
      .select("task_name")
      .eq("user_id", user.id)
      .in("task_name", ONE_TIME_TASK_NAMES);
    if (data) {
      setCompletedOneTimeTasks(new Set(data.map((a) => a.task_name)));
    }
  }, [user.id]);

  useEffect(() => {
    fetchLeaderboard();
    fetchCompletedTasks();
  }, [fetchLeaderboard, fetchCompletedTasks]);

  useEffect(() => {
    const channel = supabase
      .channel("realtime-users")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLeaderboard]);

  const rankedUsers: RankedUser[] = allUsers.map((u, i) => ({
    ...u,
    rank: i + 1,
  }));

  const currentRanked = rankedUsers.find((u) => u.id === user.id);
  const rank = currentRanked?.rank ?? rankedUsers.length + 1;
  const topFive = rankedUsers.slice(0, 5);

  const displayUser: User = {
    ...user,
    score: currentRanked?.score ?? user.score,
  };

  const handleActionLogged = (taskName: string, points: number) => {
    const updated = { ...userRef.current, score: userRef.current.score + points };
    onUserUpdate(updated);

    if (ONE_TIME_TASK_NAMES.includes(taskName) && points > 0) {
      setCompletedOneTimeTasks((prev) => new Set([...prev, taskName]));
    } else if (ONE_TIME_TASK_NAMES.includes(taskName) && points < 0) {
      setCompletedOneTimeTasks((prev) => {
        const next = new Set(prev);
        next.delete(taskName);
        return next;
      });
    }

    setAllUsers((prev) => {
      const idx = prev.findIndex((u) => u.id === userRef.current.id);
      if (idx === -1) return prev;
      const copy = [...prev];
      copy[idx] = { ...copy[idx], score: copy[idx].score + points };
      copy.sort((a, b) => b.score - a.score);
      return copy;
    });
  };

  return (
    <div className="min-h-dvh bg-gradient-to-b from-violet-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      <div className="max-w-md mx-auto">
        <UserStatusBar
          user={displayUser}
          rank={rank}
          totalUsers={allUsers.length}
          onLogout={onLogout}
        />

        <div className="px-4 py-5 space-y-5">
          <MiniLeaderboard
            topUsers={topFive}
            currentUserId={user.id}
            currentUserRank={rank}
            currentUser={currentRanked || null}
          />

          <div>
            <h2 className="text-lg font-bold mb-1">Uppdrag</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Tryck på ett uppdrag för att logga poäng
            </p>
            <ActionGrid
              userId={user.id}
              completedOneTimeTasks={completedOneTimeTasks}
              onActionLogged={handleActionLogged}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
