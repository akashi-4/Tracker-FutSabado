import { NextResponse } from "next/server";
import { getMatchHistory } from "../../../../handlers/matchHandlers";

export async function GET() {
    try {
        const matchHistory= await getMatchHistory();
        return NextResponse.json(matchHistory);
    } catch (error) {
        return NextResponse.json({ message: "Error fetching match history", error }, { status: 500 });
    }
}