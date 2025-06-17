"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import type { Goal } from "../../../types/goalType";
import type { Player } from "../../../types/playerType";
import PlayerSelector from "../../../components/PlayerSelector";
import GoalCounter from "../../../components/GoalCounter";

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

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                Loading...
            </div>
        );
    }

    if (!session || session.user.role !== "admin") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                You do not have permission to access this page.
            </div>
        );
    }

    const [showToast, setShowToast] = useState(false);
    const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => {
                setShowToast(false);
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [showToast]);

    const fetchPlayers = async () => {
        const res = await fetch("/api/players");
        const data = await res.json();
        setAvailablePlayers(data);
      };
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
        // Fetch available players
        const fetchPlayers = async () => {
            const res = await fetch("/api/players");
            const data = await res.json();
            setAvailablePlayers(data);
        };
        fetchPlayers();
    }, []);

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

    const handleSubmit = async () => {
        try {
            const teamAScore = calculateTeamScore(match.teamA.players);
            const teamBScore = calculateTeamScore(match.teamB.players);

            // First, update all players one by one
            for (const player of [...match.teamA.players, ...match.teamB.players].filter((p): p is Player => p !== null)) {
                const isTeamA = match.teamA.players.includes(player);
                const playerScore = isTeamA ? teamAScore : teamBScore;
                const opposingScore = isTeamA ? teamBScore : teamAScore;

                // Get current player stats
                const playerRes = await fetch(`/api/players/${player.name}`);
                const currentPlayer = await playerRes.json();

                const updates = {
                    goals: currentPlayer.goals + (playerGoals[player.name] || 0),
                    wins: currentPlayer.wins + (playerScore > opposingScore ? 1 : 0),
                    losses: currentPlayer.losses + (playerScore < opposingScore ? 1 : 0),
                    draws: currentPlayer.draws + (playerScore === opposingScore ? 1 : 0),
                    matchesPlayed: currentPlayer.matchesPlayed + 1
                };

                const response = await fetch(`/api/players/stats`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: player.name,
                        updates
                    })
                });

                if (!response.ok) {
                    throw new Error(`Failed to update player ${player.name}`);
                }
            }

            // Then save the match
            const matchResponse = await fetch('/api/matches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: match.date,
                    teamA: {
                        players: match.teamA.players,
                        score: teamAScore
                    },
                    teamB: {
                        players: match.teamB.players,
                        score: teamBScore
                    },
                    goals: Object.entries(playerGoals).map(([name, count]) => ({
                        scorer: name,
                        count
                    }))
                })
            });

            if (!matchResponse.ok) {
                throw new Error('Failed to save match');
            }

            // Refresh the available players data
            await fetchPlayers();

            setShowToast(true);
            setMatch({
                date: new Date().toISOString().split('T')[0],
                teamA: { players: Array(5).fill(null), score: "" },
                teamB: { players: Array(5).fill(null), score: "" },
                goals: []
            });
            setPlayerGoals({});
        } catch (error) {
            console.error('Error saving match:', error);
            setError(error instanceof Error ? error.message : 'Failed to save match');
        }
    };

    return (
        <div className="min-h-screen bg-black text-white py-12 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="bg-gray-900 p-8 rounded-xl border border-blue-900 shadow-lg">
                    <h2 className="text-3xl font-bold text-blue-400 mb-8">Add Match</h2>
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

                    {error && (
                        <div className="mt-4 text-red-500">
                            {error}
                        </div>
                    )}

                    {showToast && (
                        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg animate-slide-in">
                            Match saved successfully!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

