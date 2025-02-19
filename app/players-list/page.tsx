"use client";
import { useState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { Player } from "../../types/playerType";

type PlayerForm = {
  [K in keyof Player]: string;
};

function Page() {
  const [error, setError] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
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
  const fetchPlayers = async () => {
    const res = await fetch("/api/players");
    const data = await res.json();
    setPlayers(data);
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const handleDelete = async (name: string) => {
    const res = await fetch("/api/players", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      alert("Player deleted!");
      fetchPlayers(); // Refresh the list after deletion
    } else {
      const data = await res.json();
      alert(data.message || "Error deleting player");
    }
  };

  const handleUpdate = async (name: string, field: string, value: number) => {
    const res = await fetch("/api/players", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, field, value }),
    });

    if (res.ok) {
      alert("Player updated!");
      fetchPlayers(); // Refresh the list after update
    } else {
      const data = await res.json();
      alert(data.message || "Error updating player");
    }
  };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player); // Set the player to be edited
    setIsModalOpen(true); // Open the modal
  };

  const handleModalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Allow input changes and update the state immediately
      if (editingPlayer) {
        setEditingPlayer({
          ...editingPlayer,
          [name]: name === "name" ? value : (value ? parseInt(value) : 0),
        });
      }
    
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
  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Validate the form before submitting
    if (!validateForm()) {
      return;
    }
  
    if (editingPlayer) {
      const updatedMatches = editingPlayer.wins + editingPlayer.losses + editingPlayer.draws;
      const updatedGoalsPartic = editingPlayer.goals + editingPlayer.assists;
  
      const playerData: Player = {
        ...editingPlayer,
        goals: editingPlayer.goals ? parseInt(editingPlayer.goals.toString()) : 0,
        assists: editingPlayer.assists ? parseInt(editingPlayer.assists.toString()) : 0,
        wins: editingPlayer.wins ? parseInt(editingPlayer.wins.toString()) : 0,
        losses: editingPlayer.losses ? parseInt(editingPlayer.losses.toString()) : 0,
        draws: editingPlayer.draws ? parseInt(editingPlayer.draws.toString()) : 0,
        matches: updatedMatches,
        goals_partic: updatedGoalsPartic,
      };
      
      handleUpdate(playerData.name, "goals", playerData.goals);
      handleUpdate(playerData.name, "assists", playerData.assists);
      handleUpdate(playerData.name, "wins", playerData.wins);
      handleUpdate(playerData.name, "losses", playerData.losses);
      handleUpdate(playerData.name, "draws", playerData.draws);
      handleUpdate(playerData.name, "matches", playerData.matches);
      handleUpdate(playerData.name, "goals_partic", playerData.goals_partic);
  
      setIsModalOpen(false); // Close the modal
      fetchPlayers(); // Refresh the list after update
    }
  };
  

  return (
    <div className="min-h-screen bg-black text-white py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-900 p-8 rounded-xl border border-blue-900 shadow-lg">
          <h2 className="text-3xl font-bold text-blue-400 mb-8">Players List</h2>
          <div className="space-y-4">
            {players.length > 0 ? (
              players.map((p) => (
                <div 
                  key={p.name} 
                  className="bg-gray-800 p-4 rounded-lg border border-gray-700 
                           hover:border-blue-700 transition-all duration-300 
                           flex justify-between items-center"
                >
                  <div className="flex-grow">
                    <div className="flex items-baseline gap-4">
                      <h3 className="text-xl font-semibold text-white">{p.name}</h3>
                      <span className="text-blue-400">
                        {p.goals}G {p.assists}A
                      </span>
                    </div>
                    <div className="text-gray-400 text-sm mt-1">
                      {p.wins}W {p.draws}D {p.losses}L | {p.matches} matches
                    </div>
                  </div>
                  <div className="flex gap-3 ml-4">
                    <button
                      onClick={() => handleEdit(p)}
                      className="p-2 rounded-lg bg-gray-700 hover:bg-blue-600 
                               transition-colors duration-300"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(p.name)}
                      className="p-2 rounded-lg bg-gray-700 hover:bg-red-600 
                               transition-colors duration-300"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center italic">No players to display</p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && editingPlayer && (
        <div className="fixed inset-0 bg-black/75 flex justify-center items-center z-50">
          <div className="bg-gray-900 p-8 rounded-xl border border-blue-900 shadow-lg w-96">
            <h2 className="text-2xl font-bold text-blue-400 mb-6">
              Edit {editingPlayer.name}
            </h2>
            <form onSubmit={handleModalSubmit} className="space-y-4">
              {["goals", "assists", "wins", "losses", "draws"].map((field) => (
                <div key={field} className="space-y-2">
                  <label htmlFor={field} className="block text-blue-400 font-medium capitalize">
                    {field}
                  </label>
                  <input
                    type="number"
                    name={field}
                    value={editingPlayer[field as keyof Player]}
                    onChange={handleModalChange}
                    min="0"
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg 
                             text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                             outline-none transition-colors hover:border-gray-600"
                  />
                </div>
              ))}
              
              <div className="flex justify-end gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg 
                           hover:bg-gray-600 transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg 
                           hover:bg-blue-700 transition-colors duration-300"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Page;