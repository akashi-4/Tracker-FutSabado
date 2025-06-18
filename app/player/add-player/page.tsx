"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import type { Player } from "../../../types/playerType";
import Toast, { useToast } from "../../../components/Toast";

type PlayerForm = {
  [K in keyof Player]: string;
};

export default function AddPlayer() {
  const { toast, showToast, hideToast } = useToast();
  const { data: session, status } = useSession();

  const [player, setPlayer] = useState<PlayerForm>({
    name: "",
    goals: "",
    wins: "",
    losses: "",
    draws: "",
    matchesPlayed: "",
  });

  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Check if the field is not the name field and if the value is not empty
    if (name !== "name" && value !== "") {
      // Check if the value is a number
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
    const numericFields = ["goals", "wins", "losses", "draws", "matchesPlayed"];
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const playerData: Player = {
      ...player,
      goals: player.goals ? parseInt(player.goals) : 0,
      wins: player.wins ? parseInt(player.wins) : 0,
      losses: player.losses ? parseInt(player.losses) : 0,
      draws: player.draws ? parseInt(player.draws) : 0,
      matchesPlayed: calculateMatches(),
    };

    const res = await fetch("/api/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(playerData),
    });

    if (res.ok) {
      showToast(`Player ${player.name} successfully added!`, "success");
      setPlayer({
        name: "",
        goals: "",
        wins: "",
        losses: "",
        draws: "",
        matchesPlayed: "",
      });
      setError(null);
    } else {
      const data = await res.json();
      setError(data.message);
    }
  };

  // Show loading state while session is being fetched
  if (status === "loading") {
    return (
      <div className="loading-state">
        Loading...
      </div>
    );
  }

  // If not logged in or not an admin, block access
  if (!session || session.user.role !== "admin") {
    return (
      <div className="permission-denied">
        You do not have permission to access this page.
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="max-w-lg mx-auto">
        <div className="card">
          <h2 className="page-title-large">Create Player</h2>
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="label">
                Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Player Name"
                value={player.name}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>
            
            {["goals", "wins", "losses", "draws"].map((field) => (
              <div key={field} className="space-y-2">
                <label htmlFor={field} className="label">
                  {field}
                </label>
                <input
                  type="number"
                  name={field}
                  value={player[field as keyof PlayerForm]}
                  onChange={handleChange}
                  min="0"
                  placeholder="0"
                  className="input-field"
                />
              </div>
            ))}
            
            <button
              type="submit"
              className="btn-primary text-lg py-4 mt-8"
            >
              Add Player
            </button>
          </form>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </div>
  );
}