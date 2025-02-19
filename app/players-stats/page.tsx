"use client";
import { useState, useEffect } from "react";
import type { Player } from "../../types/playerType";

export default function ShowStats() {
  const [topScorers, setTopScorers] = useState<Player[]>([]);
  const [topAssisters, setTopAssisters] = useState<Player[]>([]);
  const [topMatches, setTopMatches] = useState<Player[]>([]);
  const [topGoalsPartic, setTopGoalsPartic] = useState<Player[]>([]);

  const fetchStats = async () => {
    const res = await fetch("/api/players/stats");
    const data = await res.json();
    setTopScorers(data.topScorers);
    setTopAssisters(data.topAssisters);
    setTopMatches(data.topMatches);
    setTopGoalsPartic(data.topGoalsPartic);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const StatCard = ({ title, data, statKey }: { title: string; data: Player[]; statKey: keyof Player }) => (
    <div className="bg-gray-900 p-6 rounded-xl border border-blue-900 shadow-lg transition-transform hover:scale-102 hover:border-blue-700">
      <h3 className="text-xl font-bold mb-4 text-blue-400">{title}</h3>
      <ul className="space-y-3">
        {data.length > 0 ? (
          data.map((player, index) => (
            <li 
              key={player.name}
              className="flex justify-between items-center p-3 rounded-lg bg-gray-800 border border-gray-700 hover:border-blue-800 transition-colors"
            >
              <span className="flex items-center">
                <span className="text-gray-400 mr-3">#{index + 1}</span>
                <span className="text-white">{player.name}</span>
              </span>
              <span className="text-blue-400 font-semibold">
                {player[statKey]} {statKey === 'goals' ? 'goals' : statKey === 'assists' ? 'assists' : statKey === 'goals_partic' ? 'G+A' : 'matches'}
              </span>
            </li>
          ))
        ) : (
          <p className="text-gray-400 italic">No data available</p>
        )}
      </ul>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-blue-400">
          Player Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard title="Top Scorers" data={topScorers} statKey="goals" />
          <StatCard title="Top Assisters" data={topAssisters} statKey="assists" />
          <StatCard 
            title="Most Goal Contributions" 
            data={topGoalsPartic} 
            statKey="goals_partic" 
          />
          <StatCard title="Most Matches" data={topMatches} statKey="matches" />
        </div>
      </div>
    </div>
  );
}