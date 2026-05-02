import { Task } from "./types";

export const TASKS: Task[] = [
  // Repeatable
  { name: "Köpa öl/cider i baren", points: 1, icon: "Beer", repeatable: true, gradient: "from-amber-500 to-yellow-500" },
  { name: "Köpa en shot i baren", points: 2, icon: "Wine", repeatable: true, gradient: "from-red-500 to-pink-500" },
  { name: "Köpa en drink i baren", points: 2, icon: "Martini", repeatable: true, gradient: "from-cyan-500 to-blue-500" },
  { name: "Vinna en omgång bingo", points: 2, icon: "Trophy", repeatable: true, gradient: "from-yellow-400 to-orange-500" },
  { name: "Klara utmaningen på bingo", points: 2, icon: "Target", repeatable: true, gradient: "from-emerald-500 to-teal-500" },

  // One-time
  { name: "Vloga med Vlogmobilen", points: 1, icon: "Video", repeatable: false, gradient: "from-purple-500 to-violet-600" },
  { name: "Ta POV-bild", points: 1, icon: "Camera", repeatable: false, gradient: "from-pink-500 to-rose-500" },
  { name: "Spontanspexa", points: 5, icon: "Star", repeatable: false, gradient: "from-yellow-400 to-amber-500" },
  { name: "Hälsa på Tuas pappa", points: 1, icon: "HandMetal", repeatable: false, gradient: "from-lime-500 to-green-500" },
  { name: "Posta nått kul i Facebookeventet", points: 1, icon: "Share2", repeatable: false, gradient: "from-blue-500 to-indigo-500" },
];

export const ONE_TIME_TASK_NAMES = TASKS
  .filter((t) => !t.repeatable)
  .map((t) => t.name);
