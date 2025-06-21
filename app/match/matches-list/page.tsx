"use client";

import { useState, useEffect } from "react";
import type { Match } from "../../../types/matchType";
import DeleteMatchButton from "../../../components/DeleteMatchButton";
import Toast, { useToast } from "../../../components/Toast";
import ConfirmDialog from "../../../components/ConfirmDialog";

function Page() {
    const { toast, showToast, hideToast } = useToast();
    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean;
        match: Match | null;
    }>({ isOpen: false, match: null });
    const [matches, setMatches] = useState<Match[]>([]);

    const fetchMatches = async () => {  
        const res = await fetch("/api/matches");
        const data = await res.json();
        setMatches(data);
    };

    useEffect(() => {   
        fetchMatches();
    }, []);

    const handleDeleteClick = (match: Match) => {
        setDeleteDialog({ isOpen: true, match });
    };

    const handleDeleteConfirm = async () => {
        const { match } = deleteDialog;
        if (!match) return;

        setDeleteDialog({ isOpen: false, match: null });

        try {
            const res = await fetch("/api/matches", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: match._id.toString() }),
            });

            if (res.ok) {
                showToast("Match deleted successfully!", "success");
                fetchMatches();
            } else {
                const data = await res.json();
                showToast(data.message || "Error deleting match", "error");
            }
        } catch (error) {
            showToast(error instanceof Error ? error.message : "Error deleting match", "error");
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialog({ isOpen: false, match: null });
    };

    return (
        <div className="page-container">
            <div className="max-w-4xl mx-auto">
                <div className="card">
                    <h2 className="page-title-large">Matches List</h2>
                    <div className="space-y-4">
                        {matches.length > 0 ? (
                            matches.map((match) => (
                                <div 
                                    key={match._id.toString()} 
                                    className="bg-gray-800/90 p-6 rounded-lg border border-gray-700 hover:border-blue-800 transition-colors"
                                >
                                    {/* Header with date and delete button */}
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-muted text-sm">
                                            {new Date(match.date).toLocaleDateString()}
                                        </span>
                                        <DeleteMatchButton match={match} onDelete={handleDeleteClick} />
                                    </div>

                                    {/* Teams and Score */}
                                    <div className="grid grid-cols-3 gap-4 items-center mb-6">
                                        {/* Team A */}
                                        <div className="text-left">
                                            <h3 className="text-accent font-bold text-lg mb-2">Team A</h3>
                                            <div className="space-y-1">
                                                {match.teamA.players.filter(p => p !== null).map((player) => (
                                                    <div key={player.name} className="text-white text-md">
                                                        {player.name}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Score */}
                                        <div className="text-center">
                                            <div className="text-4xl font-bold text-accent">
                                                {match.teamA.score} - {match.teamB.score}
                                            </div>
                                        </div>

                                        {/* Team B */}
                                        <div className="text-right">
                                            <h3 className="text-accent font-bold text-lg mb-2">Team B</h3>
                                            <div className="space-y-1">
                                                {match.teamB.players.filter(p => p !== null).map((player) => (
                                                    <div key={player.name} className="text-white text-md">
                                                        {player.name}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Goals */}
                                    {match.goals && match.goals.length > 0 && (
                                        <div className="border-t border-gray-700 pt-4">
                                            <h4 className="text-accent font-semibold mb-4 text-center">⚽ Goals Scored ⚽</h4>
                                            <div className="grid grid-cols-2 gap-6">
                                                {/* Team A Goals */}
                                                <div className="text-left">
                                                    <h5 className="text-accent font-medium mb-3">Team A</h5>
                                                    <div className="space-y-2">
                                                        {match.goals
                                                            .filter(goal => {
                                                                const scorerName = typeof goal.scorer === 'string' ? goal.scorer : goal.scorer.name;
                                                                return match.teamA.players.some(p => p?.name === scorerName);
                                                            })
                                                            .map((goal, index) => (
                                                                <div key={index} className="bg-gray-700 px-3 py-1 rounded-lg text-left">
                                                                    <span className="text-white text-sm">
                                                                        {typeof goal.scorer === 'string' ? goal.scorer : goal.scorer.name}
                                                                    </span>
                                                                    <span className="text-accent ml-2 text-sm">
                                                                        {goal.count > 7 ? `${goal.count}x⚽` : '⚽'.repeat(goal.count)}
                                                                    </span>
                                                                </div>
                                                            ))
                                                        }
                                                        {match.goals.filter(goal => {
                                                            const scorerName = typeof goal.scorer === 'string' ? goal.scorer : goal.scorer.name;
                                                            return match.teamA.players.some(p => p?.name === scorerName);
                                                        }).length === 0 && (
                                                            <div className="text-muted text-sm italic text-left">No goals</div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Team B Goals */}
                                                <div className="text-right">
                                                    <h5 className="text-accent font-medium mb-3">Team B</h5>
                                                    <div className="space-y-2">
                                                        {match.goals
                                                            .filter(goal => {
                                                                const scorerName = typeof goal.scorer === 'string' ? goal.scorer : goal.scorer.name;
                                                                return match.teamB.players.some(p => p?.name === scorerName);
                                                            })
                                                            .map((goal, index) => (
                                                                <div key={index} className="bg-gray-700 px-3 py-1 rounded-lg text-right">
                                                                    <span className="text-accent mr-2 text-sm">
                                                                        {goal.count > 5 ? `${goal.count}x⚽` : '⚽'.repeat(goal.count)}
                                                                    </span>
                                                                    <span className="text-white text-sm">
                                                                        {typeof goal.scorer === 'string' ? goal.scorer : goal.scorer.name}
                                                                    </span>
                                                                </div>
                                                            ))
                                                        }
                                                        {match.goals.filter(goal => {
                                                            const scorerName = typeof goal.scorer === 'string' ? goal.scorer : goal.scorer.name;
                                                            return match.teamB.players.some(p => p?.name === scorerName);
                                                        }).length === 0 && (
                                                            <div className="text-muted text-sm italic text-right">No goals</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-muted text-center italic">No matches to display</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                title="Delete Match"
                message={`Are you sure you want to delete this match? This will also update all player statistics. This action cannot be undone.`}
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