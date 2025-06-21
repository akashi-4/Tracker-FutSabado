import { NextResponse } from "next/server";
import { connect2DB } from "../../../../config/db";
import { authOptions } from "../../../../lib/auth";
import { getServerSession } from "next-auth/next";

export async function GET() {
  try {
    const { db } = await connect2DB();
    
    // Execute all queries in parallel
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
    const updates = await req.json();

    if (!Array.isArray(updates)) {
      return NextResponse.json({ message: "Invalid payload: expected an array of updates." }, { status: 400 });
    }

    const { db } = await connect2DB();

    const operations = updates.map(update => ({
      updateOne: {
        filter: { name: update.name },
        update: { $inc: update.updates }
      }
    }));

    if (operations.length > 0) {
      const result = await db.collection("players").bulkWrite(operations);
      
      if (result.modifiedCount !== operations.length) {
        console.warn(`Bulk update mismatch: expected ${operations.length} updates, but ${result.modifiedCount} were modified.`);
      }
    }

    return NextResponse.json({ message: "Players updated successfully" });
  } catch (error) {
    console.error('Error updating players:', error);
    return NextResponse.json({ 
      message: `Error updating players: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 });
  }
}