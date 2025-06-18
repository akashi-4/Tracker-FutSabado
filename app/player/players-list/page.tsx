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
    <div className="page-container">
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <h2 className="page-title-large">Players List</h2>
          <div className="space-y-4">
            {players.length > 0 ? (
              players.map((p) => (
                <div
                  key={p.name}
                  className="player-card"
                >
                  <div className="flex-grow">
                    <div className="flex items-baseline gap-4">
                      <h3 className="text-xl font-semibold text-white">{p.name}</h3>
                      <span className="text-accent">
                        {p.goals} goals
                      </span>
                    </div>
                    <div className="text-muted text-sm mt-1">
                      Wins: {p.wins} | Losses: {p.losses} | Draws: {p.draws}
                    </div>
                  </div>
                  <div className="flex gap-3 ml-4">
                    <EditPlayerButton player={p} onEdit={handleEdit} />
                    <DeletePlayerButton player={p} onDelete={handleDeleteClick} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted text-center italic">No players to display</p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && editingPlayer && (
        <div className="modal-overlay">
          <div className="modal-content-large">
            <h2 className="page-title-large">
              Edit {editingPlayer.name}
            </h2>
            <form onSubmit={handleModalSubmit} className="space-y-4">
              {["goals", "wins", "losses", "draws"].map((field) => (
                <div key={field} className="space-y-2">
                  <label htmlFor={field} className="label">
                    {field}
                  </label>
                  <input
                    type="number"
                    name={field}
                    value={editingPlayer[field as keyof Player]}
                    onChange={handleModalChange}
                    min="0"
                    className="input-field"
                  />
                </div>
              ))}
              <div className="flex justify-end gap-3">
              <button type="submit" className="btn-primary">
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
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
        cancelText="Cancel"
        confirmText="Delete"
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