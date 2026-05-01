"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Task, Action } from "@/lib/types";
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
      <Section title="Upprepbara uppdrag" tasks={repeatableTasks} />
      <Section title="Engångsuppdrag" tasks={oneTimeTasks} />
    </div>
  );

  function Section({ title, tasks }: { title: string; tasks: Task[] }) {
    return (
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 px-1">
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
              <Card
                key={task.name}
                onClick={() => handleTaskClick(task)}
                className={`
                  relative overflow-hidden cursor-pointer select-none
                  transition-all duration-200 active:scale-95
                  ${
                    isCompleted
                      ? "opacity-50 bg-muted border-muted cursor-not-allowed"
                      : "hover:shadow-md hover:-translate-y-0.5 border-border/50"
                  }
                  ${isAnimating ? "ring-2 ring-green-400 scale-[1.02]" : ""}
                `}
              >
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  {isLoading ? (
                    <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                  ) : isCompleted ? (
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                      <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                  ) : (
                    <Icon className="w-8 h-8 text-violet-500" />
                  )}
                  <span className="text-xs font-medium leading-tight">
                    {task.name}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      isCompleted
                        ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                        : "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
                    }`}
                  >
                    {isCompleted ? "Klart ✓" : `+${task.points}p`}
                  </span>
                </CardContent>

                {isAnimating && (
                  <div className="absolute inset-0 bg-green-400/20 animate-pulse pointer-events-none rounded-xl" />
                )}
              </Card>
            );
          })}
        </div>
      </div>
    );
  }
}
