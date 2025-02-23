import { Player } from "../types/playerType";

interface GoalCounterProps {
  player: Player | null;
  goals: number;
  onGoalChange: (count: number) => void;
}

export default function GoalCounter({ player, goals, onGoalChange }: GoalCounterProps) {
  if (!player) return null;

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => goals > 0 && onGoalChange(goals - 1)}
        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        disabled={goals === 0}
      >
        -
      </button>
      <span className="w-8 text-center">{goals}</span>
      <button
        onClick={() => onGoalChange(goals + 1)}
        className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
      >
        +
      </button>
    </div>
  );
}
