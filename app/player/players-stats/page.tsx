"use client";
import { useState, useEffect } from "react";
import type { Player } from "../../../types/playerType";

function StatCard({ title, players }: { title: string; players: { name: string; value: number }[] }) {
  return (
    <div className="stats-card">
      <h3 className="page-title">{title}</h3>
      <ul className="space-y-3">
        {players.length > 0 ? (
          players.slice(0, 10).map((player, index) => (
            <li
              key={player.name}
              className="stats-item"
            >
              <span className="flex items-center">
                <span className="text-muted mr-3">#{index + 1}</span>
                <span className="text-white">{player.name}</span>
              </span>
              <span className="text-accent font-semibold">
                {player.value}
              </span>
            </li>
          ))
        ) : (
          <p className="text-muted italic">No data available</p>
        )}
      </ul>
    </div>
  );
}

export default function PlayerStatsPage() {
  const [topScorers, setTopScorers] = useState<Player[]>([]);
  const [topMatches, setTopMatches] = useState<Player[]>([]);
  const [topWinners, setTopWinners] = useState<Player[]>([]);
  const [topLosers, setTopLosers] = useState<Player[]>([]);

  const fetchStats = async () => {
    const res = await fetch("/api/players/stats");
    const data = await res.json();
    setTopScorers(data.topScorers);
    setTopMatches(data.topMatches);
    setTopWinners(data.topWinners);
    setTopLosers(data.topLosers);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="page-container">
      <div className="max-w-6xl mx-auto">
        <div className="card">
          <h2 className="page-title-large text-center">Player Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard title="Top Scorers" players={topScorers.map(player => ({ name: player.name, value: player.goals }))} />
              <StatCard title="Most Matches" players={topMatches.map(player => ({ name: player.name, value: player.matchesPlayed }))} />
              <StatCard title="Most Wins" players={topWinners.map(player => ({ name: player.name, value: player.wins }))} />
              <StatCard title="Most Losses" players={topLosers.map(player => ({ name: player.name, value: player.losses }))} />
            </div>
        </div>
      </div>
    </div>
  );
}