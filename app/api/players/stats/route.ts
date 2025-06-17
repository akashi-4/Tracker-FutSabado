import { NextResponse } from "next/server";
import { connect2DB } from "../../../../config/db";
import { authOptions } from "../../../../lib/auth";
import { getServerSession } from "next-auth/next";

export async function GET() {
  try {
    const db = await connect2DB();
    
    // Execute all queries in parallel using Promise.all
    const [topScorers, topMatches, topWinners, topLosers] = await Promise.all([
      db.collection("players").aggregate([
        { $sort: { goals: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, name: 1, goals: 1 } }
      ]).toArray(),
    
      db.collection("players").aggregate([
        { $sort: { matchesPlayed: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, name: 1, matchesPlayed: 1 } }
      ]).toArray(),
      

      db.collection("players").aggregate([
        { $sort: { wins: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, name: 1, wins: 1 } }
      ]).toArray(),

      db.collection("players").aggregate([
        { $sort: { losses: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, name: 1, losses: 1 } }
      ]).toArray(),

    ]);

    return NextResponse.json({
      topScorers,
      topMatches,
      topWinners,
      topLosers
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ message: "Error fetching player stats" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {

  const session = await getServerSession(authOptions);
  if(!session || session.user.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { name, updates } = await req.json();
    const db = await connect2DB();

    // Update the player
    const result = await db.collection("players").updateOne(
      { name },
      { $set: updates }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ message: `Failed to update player ${name}` }, { status: 400 });
    }

    return NextResponse.json({ message: "Player updated successfully" });
  } catch (error) {
    console.error('Error updating player:', error);
    return NextResponse.json({ 
      message: `Error updating player: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 });
  }
}