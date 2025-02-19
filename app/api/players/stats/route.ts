import { NextResponse } from "next/server";
import { connect2DB } from "../../../../config/db";

export async function GET() {
  try {
    const db = await connect2DB();
    
    // Execute all queries in parallel using Promise.all
    const [topScorers, topAssisters, topMatches, topGoalsPartic] = await Promise.all([
      db.collection("players").aggregate([
        { $sort: { goals: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, name: 1, goals: 1 } }
      ]).toArray(),
      
      db.collection("players").aggregate([
        { $sort: { assists: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, name: 1, assists: 1 } }
      ]).toArray(),
      
      db.collection("players").aggregate([
        { $sort: { matches: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, name: 1, matches: 1 } }
      ]).toArray(),
      
      db.collection("players").aggregate([
        { $sort: { goals_partic: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, name: 1, goals_partic: 1 } }
      ]).toArray()
    ]);

    return NextResponse.json({
      topScorers,
      topAssisters,
      topMatches,
      topGoalsPartic
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ message: "Error fetching player stats" }, { status: 500 });
  }
}
