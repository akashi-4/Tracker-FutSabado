"use client";
import { useState, useEffect } from "react";
import type { Player } from "../../../types/playerType";
import DeletePlayerButton from "../../../components/DeletePlayerButton";
import EditPlayerButton from "../../../components/EditPlayerButton";
import ConfirmDialog from "../../../components/ConfirmDialog";
import Toast, { useToast } from "../../../components/Toast";

function Page() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    playerName: string;
  }>({ isOpen: false, playerName: "" });
  const { toast, showToast, hideToast } = useToast();

  
  const fetchPlayers = async () => {
    const res = await fetch("/api/players");
    const data = await res.json();
    setPlayers(data);
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const handleDeleteClick = (name: string) => {
    setDeleteDialog({ isOpen: true, playerName: name });
  };

  const handleDeleteConfirm = async () => {
    const { playerName } = deleteDialog;
    setDeleteDialog({ isOpen: false, playerName: "" });

    const res = await fetch("/api/players", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: playerName }),
    });

    if (res.ok) {
      showToast("Player deleted successfully!", "success");
      fetchPlayers();
    } else {
      const data = await res.json();
      showToast(data.message || "Error deleting player", "error");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, playerName: "" });
  };

  const handleUpdate = async (name: string, updates: Partial<Player>) => {
    const res = await fetch("/api/players", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, updates }),
    });

    if (res.ok) {
      fetchPlayers(); // Refresh the list after update
    } else {
      const data = await res.json();
      showToast(data.message || "Error updating player", "error");
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

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (editingPlayer && players.length > 0) {
      const originalPlayer = players.find(p => p.name === editingPlayer.name);
      if (!originalPlayer) return;

      const updatedMatches = editingPlayer.wins + editingPlayer.losses + editingPlayer.draws;
      
      const updates = {
        goals: editingPlayer.goals,
        wins: editingPlayer.wins,
        losses: editingPlayer.losses,
        draws: editingPlayer.draws,
        matchesPlayed: updatedMatches
      };

      await handleUpdate(editingPlayer.name, updates);
      
      showToast("Player updated successfully!", "success");
      setIsModalOpen(false);
      fetchPlayers();
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
                        {p.goals}G
                      </span>
                    </div>
                    <div className="text-gray-400 text-sm mt-1">
                      {p.wins}W {p.draws}D {p.losses}L | {p.matchesPlayed} matches
                    </div>
                  </div>
                  <div className="flex gap-3 ml-4">
                    <EditPlayerButton player={p} onEdit={handleEdit} />
                    <DeletePlayerButton player={p} onDelete={handleDeleteClick} />
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Player"
        message={`Are you sure you want to delete "${deleteDialog.playerName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

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

export default Page;