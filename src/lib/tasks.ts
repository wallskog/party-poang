import { Task } from "./types";

export const TASKS: Task[] = [
  // Repeatable
  { name: "Köpa öl i baren", points: 1, icon: "Beer", repeatable: true },
  { name: "Köpa en shot i baren", points: 2, icon: "Wine", repeatable: true },
  { name: "Köpa en drink i baren", points: 2, icon: "Martini", repeatable: true },
  { name: "Vinna en omgång bingo", points: 2, icon: "Trophy", repeatable: true },
  { name: "Klara utmaningen på bingo", points: 2, icon: "Target", repeatable: true },

  // One-time
  { name: "Vloga med Vlogmobilen", points: 1, icon: "Video", repeatable: false },
  { name: "Ta POV-bild", points: 1, icon: "Camera", repeatable: false },
  { name: "Spontanspexa", points: 5, icon: "Star", repeatable: false },
  { name: "Hälsa på Tuas pappa", points: 1, icon: "HandMetal", repeatable: false },
  { name: "Posta nått kul i Facebookeventet", points: 1, icon: "Share2", repeatable: false },
];

export const ONE_TIME_TASK_NAMES = TASKS
  .filter((t) => !t.repeatable)
  .map((t) => t.name);
