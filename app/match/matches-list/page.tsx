"use client";

import { useState, useEffect } from "react";
import {  Trash2 } from "lucide-react";
import type { Match } from "../../../types/matchType";
import type { Player } from "../../../types/playerType";

function Page() {
    const [matches, setMatches] = useState<Match[]>([]);

    const fetchMatches = async () => {  
        const res = await fetch("/api/matches");
        const data = await res.json();
        setMatches(data);
    };

    useEffect(() => {   
        fetchMatches();
    }, []);

    const handlePlayerStatsWhenMatchIsDeleted = async (match: Match, player: Player) => {
        try {
            console.log('Full match object:', match);
            console.log('Match goals structure:', JSON.stringify(match.goals, null, 2));
            const playerWasInTeamA = match.teamA.players.some(p => p?.name === player.name);
            const playerWasInTeamB = match.teamB.players.some(p => p?.name === player.name);
            
            if (!playerWasInTeamA && !playerWasInTeamB) return;

            // Buscar stats atuais do jogador
            const playerRes = await fetch(`/api/players/${encodeURIComponent(player.name)}`);
            if (!playerRes.ok) {
                throw new Error(`Failed to fetch player stats: ${playerRes.statusText}`);
            }
            
            const currentPlayer = await playerRes.json();
            if (!currentPlayer) {
                throw new Error(`Player ${player.name} not found`);
            }

            // Aqui está a correção - verificando se scorer é string ou objeto
            const playerGoal = match.goals.find(g => 
                (typeof g.scorer === 'string' ? g.scorer : g.scorer.name) === player.name
            );
            
            const goalsInThisMatch = playerGoal?.count || 0;
            console.log('Goals in this match:', goalsInThisMatch);

            const winsInThisMatch = getHowManyWinsThatPlayerGotInThisMatch(match, player);
            const lossesInThisMatch = getHowManyLossesThatPlayerGotInThisMatch(match, player);
            const drawsInThisMatch = getHowManyDrawsThatPlayerGotInThisMatch(match, player);

            console.log('Match stats for', player.name, {
                goalsInThisMatch,
                winsInThisMatch,
                lossesInThisMatch,
                drawsInThisMatch
            });

            const updates = {
                goals: Math.max(0, currentPlayer.goals - goalsInThisMatch),
                matchesPlayed: Math.max(0, currentPlayer.matchesPlayed - 1),
                wins: Math.max(0, currentPlayer.wins - winsInThisMatch),
                losses: Math.max(0, currentPlayer.losses - lossesInThisMatch),
                draws: Math.max(0, currentPlayer.draws - drawsInThisMatch)
            };

            console.log('Updating stats for', player.name, updates);

            const updateRes = await fetch("/api/players/stats", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    name: player.name, 
                    updates 
                }),
            });

            if (!updateRes.ok) {
                const errorData = await updateRes.json();
                throw new Error(errorData.message || "Error updating player stats");
            }
        } catch (error) {
            console.error('Error handling player stats:', error);
            throw error;
        }
    };

    const handlePlayersStatsWhenMatchIsDeleted = async (match: Match) => {
        const teamAPlayers = match.teamA.players.filter(player => player !== null);
        const teamBPlayers = match.teamB.players.filter(player => player !== null);
        
        for (const player of teamAPlayers) {
            await handlePlayerStatsWhenMatchIsDeleted(match, player);
        }
        for (const player of teamBPlayers) {
            await handlePlayerStatsWhenMatchIsDeleted(match, player);
        }
    };

    const handleDelete = async (match: Match) => {
        try {
            await handlePlayersStatsWhenMatchIsDeleted(match);
            const res = await fetch("/api/matches", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: match._id.toString() }),
            });

            if (res.ok) {
                alert("Match deleted!");
                fetchMatches();
            } else {
                const data = await res.json();
                alert(data.message || "Error deleting match");
            }
        } catch (error) {
            alert(error instanceof Error ? error.message : "Error deleting match");
        }
    };

    const getHowManyWinsThatPlayerGotInThisMatch = (match: Match, player: Player) => {
        const playerWasInTeamA = match.teamA.players.some(p => p?.name === player.name);
        const playerWasInTeamB = match.teamB.players.some(p => p?.name === player.name);
        
        if (playerWasInTeamA && match.teamA.score > match.teamB.score) return 1;
        if (playerWasInTeamB && match.teamB.score > match.teamA.score) return 1;
        return 0;
    }

    const getHowManyLossesThatPlayerGotInThisMatch = (match: Match, player: Player) => {
        const playerWasInTeamA = match.teamA.players.some(p => p?.name === player.name);
        const playerWasInTeamB = match.teamB.players.some(p => p?.name === player.name);
        
        if (playerWasInTeamA && match.teamA.score < match.teamB.score) return 1;
        if (playerWasInTeamB && match.teamB.score < match.teamA.score) return 1;
        return 0;
    }

    const getHowManyDrawsThatPlayerGotInThisMatch = (match: Match, player: Player) => {
        const playerWasInTeamA = match.teamA.players.some(p => p?.name === player.name);
        const playerWasInTeamB = match.teamB.players.some(p => p?.name === player.name);
        
        if ((playerWasInTeamA || playerWasInTeamB) && match.teamA.score === match.teamB.score) return 1;
        return 0;
    }

    return (
        <div className="min-h-screen bg-black text-white py-12 px-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-gray-900 p-8 rounded-xl border border-blue-900 shadow-lg">
                    <h2 className="text-3xl font-bold text-blue-400 mb-8">Matches List</h2>
                    <div className="space-y-4">
                        {matches.length > 0 ? (
                            matches.map((match) => (
                                <div 
                                    key={match._id.toString()} 
                                    className="bg-gray-800 p-4 rounded-lg border border-gray-700 
                                            hover:border-blue-700 transition-all duration-300"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-400 text-sm">
                                            {new Date(match.date).toLocaleDateString()}
                                        </span>
                                        <span className="text-2xl font-bold text-blue-400">
                                            {match.teamA.score} - {match.teamB.score}
                                        </span>
                                        <button
                                            onClick={() => handleDelete(match)}
                                            className="p-2 rounded-lg bg-gray-700 hover:bg-red-600"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    
                                    <div className="flex justify-between mt-4">
                                        {/* Team A */}
                                        <div className="w-[45%]">
                                            {match.teamA.players.filter(p => p !== null).map((player) => (
                                                <div key={player.name} className="text-gray-300">
                                                    {player.name}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Team B */}
                                        <div className="w-[45%] text-right">
                                            {match.teamB.players.filter(p => p !== null).map((player) => (
                                                <div key={player.name} className="text-gray-300">
                                                    {player.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400">No matches found</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Page;