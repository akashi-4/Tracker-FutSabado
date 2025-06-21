import { NextResponse } from "next/server";
import { connect2DB } from "../../../../config/db";

export async function GET() {
    try {
        const { db } = await connect2DB();
        const matches = await db.collection("matches").find().sort({ _id: 1 }).toArray();
        return NextResponse.json(matches);
    } catch (error) {
        return NextResponse.json({ message: "Error fetching matches", error }, { status: 500 });
    }
}