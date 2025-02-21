"use client";
import { useState, useEffect} from "react";
import type { Player } from "../../types/playerType";
import { CheckCircle2 } from "lucide-react";

type PlayerForm = {
  [K in keyof Player]: string;
};

export default function AddPlayer() {
  const [showToast, setShowToast] = useState(false);
  const [addedPlayerName, setAddedPlayerName] = useState("");

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showToast]);
  const [player, setPlayer] = useState<PlayerForm>({
    name: "",
    goals: "",
    assists: "",
    wins: "",
    losses: "",
    draws: "",
    matches: "",
    goals_partic: "",
  });

  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name !== "name" && value !== "") {
      if (!/^\d+$/.test(value)) {
        return;
      }
    }

    setPlayer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const numericFields = ["goals", "assists", "wins", "losses", "draws", "matches", "goals_partic"];
    for (const field of numericFields) {
      if (player[field as keyof PlayerForm] !== "" && !/^\d+$/.test(player[field as keyof PlayerForm])) {
        setError(`${field.charAt(0).toUpperCase() + field.slice(1)} must be a valid number`);
        return false;
      }
    }
    return true;
  };

  const calculateMatches = () => {
    return parseInt(player.draws) + parseInt(player.wins) + parseInt(player.losses);
  };

  const calculateGoalsPartic = () => {
    return parseInt(player.goals) + parseInt(player.assists);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const playerData: Player = {
      ...player,
      goals: player.goals ? parseInt(player.goals) : 0,
      assists: player.assists ? parseInt(player.assists) : 0,
      wins: player.wins ? parseInt(player.wins) : 0,
      losses: player.losses ? parseInt(player.losses) : 0,
      draws: player.draws ? parseInt(player.draws) : 0,
      matches: calculateMatches(),
      goals_partic: calculateGoalsPartic(),
    };

    const res = await fetch("/api/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(playerData),
    });

    if (res.ok) {
      setAddedPlayerName(player.name);
      setShowToast(true);
      setPlayer({
        name: "",
        goals: "",
        assists: "",
        wins: "",
        losses: "",
        draws: "",
        matches: "",
        goals_partic: "",
      });
      setError(null);
    } else {
      const data = await res.json();
      setError(data.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-12 px-6">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-gray-900 border border-blue-900 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span className="font-medium">
              Player <span className="text-blue-400">{addedPlayerName}</span> successfully added!
            </span>
          </div>
        </div>
      )}
      <div className="max-w-lg mx-auto">
        <div className="bg-gray-900 p-8 rounded-xl border border-blue-900 shadow-lg">
          <h2 className="text-3xl font-bold text-center text-blue-400 mb-8">Create Player</h2>
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-blue-400 font-medium">
                Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Player Name"
                value={player.name}
                onChange={handleChange}
                required
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
                         transition-colors hover:border-gray-600"
              />
            </div>
            
            {["goals", "assists", "wins", "losses", "draws"].map((field) => (
              <div key={field} className="space-y-2">
                <label htmlFor={field} className="block text-blue-400 font-medium capitalize">
                  {field}
                </label>
                <input
                  type="number"
                  name={field}
                  value={player[field as keyof PlayerForm]}
                  onChange={handleChange}
                  min="0"
                  placeholder="0"
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
                           transition-colors hover:border-gray-600 appearance-none"
                />
              </div>
            ))}
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-4 rounded-lg shadow-md 
                       hover:bg-blue-700 transition-all duration-300 mt-8
                       font-semibold text-lg"
            >
              Add Player
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}