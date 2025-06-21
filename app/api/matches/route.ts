import { connect2DB } from "../../../config/db";
import { ObjectId } from "mongodb";
import { authOptions } from "../../../lib/auth";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { getMatches, createMatch, deleteMatch } from "../../../handlers/matchHandlers";

export async function GET() {
    try {
        const matches = await getMatches();
        return NextResponse.json(matches);
    } catch (error) {
        return NextResponse.json({ message: "Error fetching matches", error }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { client, db } = await connect2DB();
    const mongoSession = client.startSession();

    try {
        await mongoSession.startTransaction();
        const matchData = await req.json();

        // --- Step 1: Full validation at the start ---
        if (!matchData.date || !matchData.teamA || !matchData.teamB || matchData.teamA.score === undefined || matchData.teamB.score === undefined) {
            throw new Error("Invalid match data: Missing required fields (date, teams, or scores).");
        }

        const teamAPlayers = matchData.teamA.players.filter(p => p !== null);
        const teamBPlayers = matchData.teamB.players.filter(p => p !== null);

        console.log(`VALIDATING MATCH: Team A has ${teamAPlayers.length} players, Team B has ${teamBPlayers.length} players.`);

        if (teamAPlayers.length === 0 || teamBPlayers.length === 0) {
            throw new Error('Invalid match: Both teams must have at least one player.');
        }

        if (teamAPlayers.length !== teamBPlayers.length) {
            throw new Error('Invalid match: Teams must have the same number of players.');
        }

        // --- Step 2: Calculate player stat changes ---
        const teamAScore = matchData.teamA.score;
        const teamBScore = matchData.teamB.score;
        const allPlayersInMatch = [...teamAPlayers, ...teamBPlayers];

        const goalsScoredMap = new Map<string, number>();
        if (matchData.goals) {
            for (const goal of matchData.goals) {
                goalsScoredMap.set(goal.scorer, goal.count);
            }
        }

        const playerUpdates = allPlayersInMatch.map(player => {
            const wasInTeamA = teamAPlayers.some(p => p.name === player.name);
            const winChange = (wasInTeamA && teamAScore > teamBScore) || (!wasInTeamA && teamBScore > teamAScore) ? 1 : 0;
            const lossChange = (wasInTeamA && teamAScore < teamBScore) || (!wasInTeamA && teamBScore < teamAScore) ? 1 : 0;
            const drawChange = teamAScore === teamBScore ? 1 : 0;
            const goalChange = goalsScoredMap.get(player.name) || 0;

            return {
                updateOne: {
                    filter: { name: player.name },
                    update: { $inc: { wins: winChange, losses: lossChange, draws: drawChange, goals: goalChange, matchesPlayed: 1 } }
                }
            };
        });

        // --- Step 3: Perform the bulk update for player stats ---
        if (playerUpdates.length > 0) {
            await db.collection("players").bulkWrite(playerUpdates, { session: mongoSession });
        }
        
        // --- Step 4: Create the match ---
        const matchToCreate = {
            ...matchData,
            teamA: { ...matchData.teamA, players: teamAPlayers },
            teamB: { ...matchData.teamB, players: teamBPlayers },
        };
        const result = await createMatch(matchToCreate, { session: mongoSession });

        // --- Step 5: Commit the transaction ---
        await mongoSession.commitTransaction();

        return NextResponse.json(result, { status: 201 });

    } catch (error) {
        await mongoSession.abortTransaction();

        if (error instanceof Error && error.message.startsWith('Invalid match:')) {
            return NextResponse.json({ message: error.message }, { status: 400 });
        }
        
        console.error("Error creating match:", error);
        const errorMessage = error instanceof Error ? error.message : "An internal server error occurred.";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    } finally {
        await mongoSession.endSession();
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    try {
        const { id } = await req.json();
        const { db } = await connect2DB();

        // Find the match to get player and score data
        const matchToDelete = await db.collection("matches").findOne({ _id: new ObjectId(id) });

        if (!matchToDelete) {
            return NextResponse.json({ message: "Match not found" }, { status: 404 });
        }

        // Calculate the stat changes to revert
        const teamAScore = matchToDelete.teamA.score;
        const teamBScore = matchToDelete.teamB.score;
        
        // --- FIX: Filter out any potential null values from player arrays ---
        const teamAPlayers = matchToDelete.teamA.players.filter(p => p !== null);
        const teamBPlayers = matchToDelete.teamB.players.filter(p => p !== null);
        const allPlayersInMatch = [...teamAPlayers, ...teamBPlayers];
        
        const goalsScoredMap = new Map<string, number>();
        if (matchToDelete.goals) {
            for (const goal of matchToDelete.goals) {
                goalsScoredMap.set(goal.scorer, goal.count);
            }
        }

        const playerUpdates = allPlayersInMatch.map(player => {
            const wasInTeamA = teamAPlayers.some(p => p.name === player.name);
            const winChange = (wasInTeamA && teamAScore > teamBScore) || (!wasInTeamA && teamBScore > teamAScore) ? -1 : 0;
            const lossChange = (wasInTeamA && teamAScore < teamBScore) || (!wasInTeamA && teamBScore < teamAScore) ? -1 : 0;
            const drawChange = teamAScore === teamBScore ? -1 : 0;
            const goalChange = -(goalsScoredMap.get(player.name) || 0);

            return {
                updateOne: {
                    filter: { name: player.name },
                    update: { $inc: { wins: winChange, losses: lossChange, draws: drawChange, goals: goalChange, matchesPlayed: -1 } }
                }
            };
        });

        // --- Step 3: Perform the bulk update for player stats and delete the match ---
        if (playerUpdates.length > 0) {
            await db.collection("players").bulkWrite(playerUpdates);
        }

        const result = await deleteMatch(id); // Calls the simple handler

        if (result.deletedCount === 0) {
            // This case might be redundant now but is safe to keep
            return NextResponse.json({ message: "Match not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Match deleted successfully" }, { status: 200 });
        
    } catch (error) {
        return NextResponse.json({ message: "Error deleting match " + error }, { status: 500 });
    }
}








