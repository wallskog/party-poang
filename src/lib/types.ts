export interface User {
  id: string;
  name: string;
  score: number;
  created_at: string;
}

export interface Action {
  id: string;
  user_id: string;
  task_name: string;
  points: number;
  created_at: string;
}

export interface Task {
  name: string;
  points: number;
  icon: string;
  repeatable: boolean;
}

export interface RankedUser extends User {
  rank: number;
}
