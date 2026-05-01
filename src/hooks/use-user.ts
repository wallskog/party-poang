"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@/lib/types";

const STORAGE_KEY = "party-poang-user-id";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async (id: string) => {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();
    if (data) setUser(data);
    else localStorage.removeItem(STORAGE_KEY);
    setLoading(false);
  }, []);

  useEffect(() => {
    const storedId = localStorage.getItem(STORAGE_KEY);
    if (storedId) {
      fetchUser(storedId);
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  const login = async (name: string): Promise<User | null> => {
    const trimmed = name.trim();
    if (!trimmed) return null;

    // Try to find existing user
    const { data: existing, error: findError } = await supabase
      .from("users")
      .select("*")
      .eq("name", trimmed)
      .single();

    if (existing) {
      localStorage.setItem(STORAGE_KEY, existing.id);
      setUser(existing);
      return existing;
    }

    // PGRST116 = no rows found — that's expected, we'll create the user
    if (findError && findError.code !== "PGRST116") {
      console.error("Supabase find user error:", findError);
      throw new Error(findError.message);
    }

    // Create new user
    const { data: created, error: createError } = await supabase
      .from("users")
      .insert({ name: trimmed })
      .select()
      .single();

    if (createError || !created) {
      console.error("Supabase create user error:", createError);
      throw new Error(createError?.message ?? "Kunde inte skapa användare");
    }

    localStorage.setItem(STORAGE_KEY, created.id);
    setUser(created);
    return created;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const refreshUser = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();
    if (data) setUser(data);
  };

  return { user, loading, login, logout, refreshUser, setUser };
}
