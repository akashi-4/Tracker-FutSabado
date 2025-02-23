import { NextResponse } from "next/server";
import { connect2DB } from "../../../config/db";

export async function GET() {
  const db = await connect2DB();
  const players = await db.collection("players").find().toArray();
  return NextResponse.json(players);
}

export async function POST(req: Request) {
  try {
    const player = await req.json();
    const db = await connect2DB();

    // Check if player already exists
    const existingPlayer = await db.collection("players").findOne({ name: player.name });
    if (existingPlayer) {
      return NextResponse.json({ message: "Player name must be unique!" }, { status: 400 });
    }

    // Insert the player into the database
    await db.collection("players").insertOne(player);
    return NextResponse.json({ message: "Player added successfully" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error adding player", error }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { name } = await req.json(); // Receber o nome do jogador a ser deletado
    const db = await connect2DB();

    // Deletar o jogador pelo nome
    const result = await db.collection("players").deleteOne({ name });

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
