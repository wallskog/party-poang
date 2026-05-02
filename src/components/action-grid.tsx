"use client";

import { useState } from "react";
import { Task } from "@/lib/types";
import { TASKS } from "@/lib/tasks";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Beer,
  Wine,
  Martini,
  Trophy,
  Target,
  Video,
  Camera,
  Star,
  HandMetal,
  Share2,
  Check,
  Loader2,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Beer,
  Wine,
  Martini,
  Trophy,
  Target,
  Video,
  Camera,
  Star,
  HandMetal,
  Share2,
};

interface ActionGridProps {
  userId: string;
  completedOneTimeTasks: Set<string>;
  onActionLogged: (taskName: string, points: number) => void;
}

export function ActionGrid({
  userId,
  completedOneTimeTasks,
  onActionLogged,
}: ActionGridProps) {
  const [loadingTask, setLoadingTask] = useState<string | null>(null);
  const [animatingTask, setAnimatingTask] = useState<string | null>(null);

  const handleTaskClick = async (task: Task) => {
    if (loadingTask) return;
    if (!task.repeatable && completedOneTimeTasks.has(task.name)) return;

    setLoadingTask(task.name);
    onActionLogged(task.name, task.points);

    const { error } = await supabase.from("actions").insert({
      user_id: userId,
      task_name: task.name,
      points: task.points,
    });

    if (error) {
      onActionLogged(task.name, -task.points);
      if (error.code === "23505") {
        toast.error("Redan avklarat!", {
          description: `Du har redan gjort "${task.name}"`,
        });
      } else {
        toast.error("Något gick fel", {
          description: "Försök igen om en stund",
        });
      }
      setLoadingTask(null);
      return;
    }

    setAnimatingTask(task.name);
    toast.success(`+${task.points} poäng!`, {
      description: task.name,
    });

    setTimeout(() => setAnimatingTask(null), 600);
    setLoadingTask(null);
  };

  const repeatableTasks = TASKS.filter((t) => t.repeatable);
  const oneTimeTasks = TASKS.filter((t) => !t.repeatable);

  return (
    <div className="space-y-6">
      <Section title="🔄 Upprepbara uppdrag" tasks={repeatableTasks} />
      <Section title="⚡ Engångsuppdrag" tasks={oneTimeTasks} />
    </div>
  );

  function Section({ title, tasks }: { title: string; tasks: Task[] }) {
    return (
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3 px-1">
          {title}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {tasks.map((task) => {
            const Icon = ICON_MAP[task.icon] || Star;
            const isCompleted =
              !task.repeatable && completedOneTimeTasks.has(task.name);
            const isLoading = loadingTask === task.name;
            const isAnimating = animatingTask === task.name;

            return (
              <button
                key={task.name}
                onClick={() => handleTaskClick(task)}
                disabled={isCompleted || !!loadingTask}
                className={`
                  relative overflow-hidden rounded-2xl p-4 select-none
                  transition-all duration-200 active:scale-95 text-left
                  flex flex-col items-center text-center gap-2.5 cursor-pointer
                  ${
                    isCompleted
                      ? "bg-white/5 opacity-40 cursor-not-allowed"
                      : `bg-gradient-to-br ${task.gradient} shadow-lg hover:shadow-xl hover:-translate-y-0.5`
                  }
                  ${isAnimating ? "scale-[1.05] ring-2 ring-white/50" : ""}
                `}
              >
                {isLoading ? (
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                ) : isCompleted ? (
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                ) : (
                  <Icon className="w-8 h-8 text-white drop-shadow-md" />
                )}

                <span className="text-[11px] font-semibold leading-tight text-white drop-shadow-sm">
                  {task.name}
                </span>

                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    isCompleted
                      ? "bg-white/10 text-white/50"
                      : "bg-black/20 text-white"
                  }`}
                >
                  {isCompleted ? "Klart ✓" : `+${task.points}p`}
                </span>

                {isAnimating && (
                  <div className="absolute inset-0 bg-white/30 animate-pulse pointer-events-none rounded-2xl" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }
}
