
import { connect2DB } from "../../../config/db";
import { ObjectId } from "mongodb";
import { authOptions } from "../auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    const db = await connect2DB();
    const matches = await db.collection("matches").find().toArray();
    return NextResponse.json(matches);
}

export async function POST(req: Request) {

    const session = await getServerSession(authOptions);
    if(!session || session.user.role !== "admin") {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const match = await req.json();
    const db = await connect2DB();
    await db.collection("matches").insertOne(match);
    return NextResponse.json({ message: "Match added successfully" }, { status: 201 });
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if(!session || session.user.role !== "admin") {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    try {
        const { id } = await req.json();
        const db = await connect2DB();
        
        const result = await db.collection("matches").deleteOne({ 
            _id: new ObjectId(id)
        });

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { message: "Match not found" }, 
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Match deleted successfully" }, 
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Error deleting match " + error }, 
            { status: 500 }
        );
    }
}








