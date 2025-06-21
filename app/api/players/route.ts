import { NextResponse } from "next/server";
import { authOptions } from "../../../lib/auth";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { createPlayer, deletePlayer, getPlayerByName, getPlayers, updatePlayer } from "../../../handlers/playerHandlers";
import { Player } from "../../../types/playerType";

const PlayerSchema = z.object({
  name: z.string().trim().min(1).max(50)
          .regex(/^[a-zA-Z][a-zA-Z\s]*$/, "Name must start with a letter and contain only letters and spaces"),
  goals: z.preprocess(
    (val) => val === "" || val === undefined ? 0 : Number(val),
    z.number().int().min(0)
  ),
  wins: z.preprocess(
    (val) => val === "" || val === undefined ? 0 : Number(val),
    z.number().int().min(0)
  ),
  losses: z.preprocess(
    (val) => val === "" || val === undefined ? 0 : Number(val),
    z.number().int().min(0)
  ),
  draws: z.preprocess(
    (val) => val === "" || val === undefined ? 0 : Number(val),
    z.number().int().min(0)
  ),
  matchesPlayed: z.preprocess(
    (val) => val === "" || val === undefined ? 0 : Number(val),
    z.number().int().min(0)
  ),
});

export async function GET() {
  try {
    const players = await getPlayers();
    return NextResponse.json(players);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching players", error }, { status: 500 });
  }
}

export async function POST(req: Request) {

  const session = await getServerSession(authOptions);
  if(!session || session.user.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = PlayerSchema.parse(await req.json());

    const existingPlayer = await getPlayerByName(body.name);
    if (existingPlayer) {
      return NextResponse.json({ message: "Player name must be unique!" }, { status: 400 });
    }

    await createPlayer(body as Player);
    return NextResponse.json({ message: "Player added successfully" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error adding player", error }, { status: 500 });
  }
}

export async function DELETE(req: Request) {

  const session = await getServerSession(authOptions);
  if(!session || session.user.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { name } = await req.json();

    const result = await deletePlayer(name);

    if (result.deletedCount === 1) {
      return NextResponse.json({ message: "Player deleted successfully" });
    } else {
      return NextResponse.json({ message: "Player not found" }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ message: "Error deleting player", error }, { status: 500 });
  }
}

export async function PATCH(req: Request) {

  const session = await getServerSession(authOptions);
  if(!session || session.user.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { name, updates } = await req.json();

    const result = await updatePlayer(name, updates);

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
