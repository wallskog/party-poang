"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { User, Action } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Lock,
  Loader2,
  Pencil,
  Trash2,
  Plus,
  Minus,
  Check,
  X,
  ArrowLeft,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const ADMIN_PIN = "tua2026";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just nu";
  if (mins < 60) return `${mins} min sedan`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h sedan`;
  return `${Math.floor(hours / 24)}d sedan`;
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editScore, setEditScore] = useState(0);
  const [adjustAmount, setAdjustAmount] = useState<Record<string, number>>({});
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [userActions, setUserActions] = useState<Record<string, Action[]>>({});
  const [loadingActions, setLoadingActions] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    const { data } = await supabase
      .from("users")
      .select("*")
      .order("score", { ascending: false });
    if (data) setUsers(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem("admin-auth");
    if (stored === ADMIN_PIN) setAuthenticated(true);
  }, []);

  useEffect(() => {
    if (authenticated) fetchUsers();
  }, [authenticated, fetchUsers]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem("admin-auth", pin);
      setAuthenticated(true);
    } else {
      toast.error("Fel PIN-kod");
    }
  };

  const startEdit = (user: User) => {
    setEditingId(user.id);
    setEditName(user.name);
    setEditScore(user.score);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditScore(0);
  };

  const saveEdit = async (user: User) => {
    const updates: Partial<User> = {};
    if (editName.trim() && editName.trim() !== user.name) updates.name = editName.trim();
    if (editScore !== user.score) updates.score = editScore;

    if (Object.keys(updates).length === 0) {
      cancelEdit();
      return;
    }

    const { error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", user.id);

    if (error) {
      toast.error("Kunde inte spara", { description: error.message });
      return;
    }

    toast.success("Sparad!");
    cancelEdit();
    fetchUsers();
  };

  const adjustScore = async (userId: string, delta: number) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const newScore = Math.max(0, user.score + delta);
    const { error } = await supabase
      .from("users")
      .update({ score: newScore })
      .eq("id", userId);

    if (error) {
      toast.error("Kunde inte ändra poäng", { description: error.message });
      return;
    }

    toast.success(`${delta > 0 ? "+" : ""}${delta} poäng för ${user.name}`);
    fetchUsers();
  };

  const deleteUser = async (user: User) => {
    if (!confirm(`Ta bort ${user.name}? Alla deras poäng försvinner.`)) return;

    const { error } = await supabase.from("users").delete().eq("id", user.id);

    if (error) {
      toast.error("Kunde inte ta bort", { description: error.message });
      return;
    }

    toast.success(`${user.name} borttagen`);
    if (expandedUserId === user.id) setExpandedUserId(null);
    setUserActions((prev) => {
      const next = { ...prev };
      delete next[user.id];
      return next;
    });
    fetchUsers();
  };

  const fetchActions = async (userId: string) => {
    setLoadingActions(userId);
    const { data } = await supabase
      .from("actions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (data) {
      setUserActions((prev) => ({ ...prev, [userId]: data }));
    }
    setLoadingActions(null);
  };

  const toggleExpand = async (userId: string) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
      return;
    }
    setExpandedUserId(userId);
    await fetchActions(userId);
  };

  const deleteAction = async (action: Action) => {
    const user = users.find((u) => u.id === action.user_id);
    if (!confirm(`Ta bort "${action.task_name}" (+${action.points}p) från ${user?.name ?? "användaren"}?`)) return;

    const { error } = await supabase.from("actions").delete().eq("id", action.id);

    if (error) {
      toast.error("Kunde inte ta bort", { description: error.message });
      return;
    }

    // Recalculate user score from remaining actions
    const { data: remaining } = await supabase
      .from("actions")
      .select("points")
      .eq("user_id", action.user_id);

    const newScore = remaining ? remaining.reduce((sum, a) => sum + a.points, 0) : 0;
    await supabase
      .from("users")
      .update({ score: newScore })
      .eq("id", action.user_id);

    toast.success(`Tog bort "${action.task_name}" (-${action.points}p)`);
    await fetchActions(action.user_id);
    fetchUsers();
  };

  if (!authenticated) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gradient-to-b from-[#1a0533] via-[#0f0a1e] to-[#0a0612] p-4">
        <div className="w-full max-w-xs space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 mb-2">
              <Lock className="w-7 h-7 text-white/60" />
            </div>
            <h1 className="text-xl font-bold text-white">Admin</h1>
            <p className="text-white/40 text-sm">Ange PIN-kod</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-3">
            <Input
              type="password"
              placeholder="PIN..."
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="h-12 bg-white/10 border-white/10 text-white placeholder:text-white/30 text-center text-xl tracking-[0.3em] rounded-xl focus-visible:ring-violet-500/50"
              autoFocus
            />
            <Button
              type="submit"
              disabled={!pin}
              className="w-full h-11 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl cursor-pointer"
            >
              Logga in
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#1a0533] via-[#0f0a1e] to-[#0a0612]">
      <div className="max-w-lg mx-auto">
        <div className="sticky top-0 z-50 bg-white/5 backdrop-blur-xl border-b border-white/10">
          <div className="px-4 py-4 flex items-center gap-3">
            <Link
              href="/"
              className="p-2 -ml-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h1 className="text-lg font-bold text-white">Admin</h1>
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
            <p className="text-center text-white/40 py-12">Inga gäster ännu.</p>
          ) : (
            <div className="space-y-2">
              {users.map((u, i) => {
                const isEditing = editingId === u.id;
                const amount = adjustAmount[u.id] ?? 1;
                const isExpanded = expandedUserId === u.id;
                const actions = userActions[u.id];
                const isLoadingThis = loadingActions === u.id;

                return (
                  <div
                    key={u.id}
                    className="bg-white/5 rounded-xl border border-white/10 overflow-hidden"
                  >
                    <div className="p-4 space-y-3">
                      {isEditing ? (
                        <>
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-wider text-white/30">Namn</label>
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="h-10 bg-white/10 border-white/10 text-white rounded-lg text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-wider text-white/30">Poäng</label>
                            <Input
                              type="number"
                              value={editScore}
                              onChange={(e) => setEditScore(parseInt(e.target.value) || 0)}
                              className="h-10 bg-white/10 border-white/10 text-white rounded-lg text-sm"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => saveEdit(u)}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg cursor-pointer"
                            >
                              <Check className="w-4 h-4 mr-1" /> Spara
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEdit}
                              className="border-white/10 text-white bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-xs font-bold text-white/30 w-5 text-center">
                                {i + 1}.
                              </span>
                              <span className="text-sm font-semibold text-white truncate">
                                {u.name}
                              </span>
                            </div>
                            <span className="text-lg font-black text-white tabular-nums">
                              {u.score}p
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 flex-1">
                              <Button
                                size="sm"
                                onClick={() => adjustScore(u.id, -amount)}
                                className="h-8 w-8 p-0 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </Button>
                              <Input
                                type="number"
                                min={1}
                                value={amount}
                                onChange={(e) =>
                                  setAdjustAmount((prev) => ({
                                    ...prev,
                                    [u.id]: Math.max(1, parseInt(e.target.value) || 1),
                                  }))
                                }
                                className="h-8 w-14 text-center bg-white/5 border-white/10 text-white text-sm rounded-lg"
                              />
                              <Button
                                size="sm"
                                onClick={() => adjustScore(u.id, amount)}
                                className="h-8 w-8 p-0 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 rounded-lg cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </Button>
                            </div>

                            <Button
                              size="sm"
                              onClick={() => toggleExpand(u.id)}
                              className={`h-8 w-8 p-0 rounded-lg cursor-pointer transition-colors ${
                                isExpanded
                                  ? "bg-violet-600/30 text-violet-300"
                                  : "bg-white/5 hover:bg-white/15 text-white/50"
                              }`}
                            >
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => startEdit(u)}
                              className="h-8 w-8 p-0 bg-white/5 hover:bg-white/15 text-white/50 rounded-lg cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => deleteUser(u)}
                              className="h-8 w-8 p-0 bg-white/5 hover:bg-red-600/30 text-white/30 hover:text-red-400 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>

                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-white/5">
                        <div className="pt-3">
                          {isLoadingThis ? (
                            <div className="flex justify-center py-3">
                              <Loader2 className="w-4 h-4 text-white/30 animate-spin" />
                            </div>
                          ) : !actions || actions.length === 0 ? (
                            <p className="text-xs text-white/30 py-2">
                              Inga loggade uppdrag.
                            </p>
                          ) : (
                            <div className="space-y-1">
                              {actions.map((a) => (
                                <div
                                  key={a.id}
                                  className="flex items-center gap-2 group rounded-lg hover:bg-white/5 px-2 py-1.5 -mx-2"
                                >
                                  <span className="text-xs text-white/50 truncate flex-1">
                                    {a.task_name}
                                  </span>
                                  <span className="text-[10px] text-white/20 flex-shrink-0">
                                    {timeAgo(a.created_at)}
                                  </span>
                                  <span className="text-xs font-bold text-emerald-400 tabular-nums flex-shrink-0 w-8 text-right">
                                    +{a.points}p
                                  </span>
                                  <button
                                    onClick={() => deleteAction(a)}
                                    className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-600/30 text-white/20 hover:text-red-400 transition-all cursor-pointer flex-shrink-0"
                                    title="Ta bort"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                              <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-2 px-2 -mx-2">
                                <span className="text-[10px] text-white/30 uppercase tracking-wider">
                                  {actions.length} uppdrag
                                </span>
                                <span className="text-xs font-bold text-white/50 tabular-nums">
                                  = {actions.reduce((s, a) => s + a.points, 0)}p
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
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
