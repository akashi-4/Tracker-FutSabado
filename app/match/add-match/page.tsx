"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import type { Goal } from "../../../types/goalType";
import type { Player } from "../../../types/playerType";
import PlayerSelector from "../../../components/PlayerSelector";
import GoalCounter from "../../../components/GoalCounter";
import AlertDialog from "../../../components/AlertDialog";

type MatchForm = {
    date: string;
    teamA: {
        players: Player[];
        score: string;
    };
    teamB: {
        players: Player[];
        score: string;
    };
    goals: Goal[];
};

export default function AddMatch() {
    const { data: session, status } = useSession();
    const [showToast, setShowToast] = useState(false);
    const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
    const [match, setMatch] = useState<MatchForm>({
        date: new Date().toISOString().split('T')[0],
        teamA: {
            players: Array(5).fill(null),
            score: ""
        },
        teamB: {
            players: Array(5).fill(null),
            score: ""
        },
        goals: []
    });
    const [error, setError] = useState<string | null>(null);
    const [playerGoals, setPlayerGoals] = useState<Record<string, number>>({});

    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => {
                setShowToast(false);
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [showToast]);
    
    useEffect(() => {
        // Fetch available players
        const fetchPlayers = async () => {
            const res = await fetch("/api/players");
            const data = await res.json();
            setAvailablePlayers(data);
        };
        fetchPlayers();
    }, []);

    if (status === "loading") {
        return (
            <div className="loading-state">
                Loading...
            </div>
        );
    }

    if (!session || session.user.role !== "admin") {
        return (
            <div className="permission-denied">
                You do not have permission to access this page.
            </div>
        );
    }

    const fetchPlayers = async () => {
        const res = await fetch("/api/players");
        const data = await res.json();
        setAvailablePlayers(data);
    };

    const handlePlayerSelect = (player: Player, position: number, team: 'A' | 'B') => {
        setMatch(prev => ({
            ...prev,
            [`team${team}`]: {
                ...prev[`team${team}`],
                players: prev[`team${team}`].players.map((p, i) => 
                    i === position ? player : p
                )
            }
        }));
    };

    const handleGoalChange = (playerName: string, count: number) => {
        setPlayerGoals(prev => ({
            ...prev,
            [playerName]: count
        }));
    };

    const calculateTeamScore = (teamPlayers: (Player | null)[]) => {
        return teamPlayers.reduce((total, player) => 
            total + (player ? (playerGoals[player.name] || 0) : 0), 0
        );
    };

    const handleCloseErrorDialog = () => {
        setError(null);
    };

    const handleSubmit = async () => {
        try {
            const teamAScore = calculateTeamScore(match.teamA.players);
            const teamBScore = calculateTeamScore(match.teamB.players);

            // Filter out null players before sending
            const teamAPlayers = match.teamA.players.filter((p): p is Player => p !== null);
            const teamBPlayers = match.teamB.players.filter((p): p is Player => p !== null);
            
            // The entire match creation process is now handled by a single API call
            const matchResponse = await fetch('/api/matches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: match.date,
                    teamA: {
                        players: teamAPlayers,
                        score: teamAScore
                    },
                    teamB: {
                        players: teamBPlayers,
                        score: teamBScore
                    },
                    goals: Object.entries(playerGoals).map(([name, count]) => ({
                        scorer: name,
                        count
                    }))
                })
            });

            if (!matchResponse.ok) {
                const errorData = await matchResponse.json();
                throw new Error(errorData.message || 'Failed to save match');
            }

            await fetchPlayers();
            setShowToast(true);

            // Reset form state
            setMatch({
                date: new Date().toISOString().split('T')[0],
                teamA: { players: Array(5).fill(null), score: "" },
                teamB: { players: Array(5).fill(null), score: "" },
                goals: []
            });
            setPlayerGoals({});
        } catch (error) {
            console.error('Error saving match:', error);
            setError(error instanceof Error ? error.message : 'An unexpected error occurred.');
        }
    };

    return (
        <div className="page-container">
            <AlertDialog
                isOpen={!!error}
                onClose={handleCloseErrorDialog}
                title="Error Creating Match"
            >
                {error}
            </AlertDialog>

            <div className="max-w-6xl mx-auto">
                <div className="card">
                    <h2 className="page-title-large">Add Match</h2>
                    <div className="flex justify-between gap-8">
                        {/* Team A Side */}
                        <div className="flex-1">
                            <PlayerSelector
                                players={availablePlayers}
                                team="A"
                                onPlayerSelect={(player, position) => handlePlayerSelect(player, position, 'A')}
                                selectedPlayers={match.teamA.players}
                                otherTeamPlayers={match.teamB.players}
                            />
                            {/* Goals Section */}
                            <div className="mt-6 space-y-4">
                                {match.teamA.players.map((player) => (
                                    player && (
                                        <div key={player.name} className="flex justify-between items-center">
                                            <span>{player.name}</span>
                                            <GoalCounter
                                                player={player}
                                                goals={playerGoals[player.name] || 0}
                                                onGoalChange={(count) => handleGoalChange(player.name, count)}
                                            />
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>

                        {/* Team B Side */}
                        <div className="flex-1">
                            <PlayerSelector
                                players={availablePlayers}
                                team="B"
                                onPlayerSelect={(player, position) => handlePlayerSelect(player, position, 'B')}
                                selectedPlayers={match.teamB.players}
                                otherTeamPlayers={match.teamA.players}
                            />
                            {/* Goals Section */}
                            <div className="mt-6 space-y-4">
                                {match.teamB.players.map((player) => (
                                    player && (
                                        <div key={player.name} className="flex justify-between items-center">
                                            <span>{player.name}</span>
                                            <GoalCounter
                                                player={player}
                                                goals={playerGoals[player.name] || 0}
                                                onGoalChange={(count) => handleGoalChange(player.name, count)}
                                            />
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={handleSubmit}
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            Submit Match
                        </button>
                    </div>

                    {showToast && (
                        <div className="fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[60] animate-slide-in">
                            Match saved successfully!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

