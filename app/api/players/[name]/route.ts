import { NextResponse } from "next/server";
import { connect2DB } from "../../../../config/db";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ name: string }> }
): Promise<NextResponse> {
    try {
        const name = (await params).name;

        if (!name) {
            return NextResponse.json(
                { message: "Player name is required" },
                { status: 400 }
            );
        }

        const db = await connect2DB();
        const player = await db.collection("players").findOne({ name });

        if (!player) {
            return NextResponse.json(
                { message: "Player not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(player);
    } catch (error) {
        console.error("Error fetching player:", error);
        return NextResponse.json(
            { message: "Error fetching player" },
            { status: 500 }
        );
    }
}
