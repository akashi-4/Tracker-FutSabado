import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../../../config/db";
import { hash } from "bcryptjs";

export async function POST(req: NextRequest) {
  const { email, password, role } = await req.json();

  // Basic validation
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    password.length < 8
  )
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 400 }
    );

  const client = await clientPromise;
  const db = client.db();

  const existing = await db.collection("users").findOne({ email });
  if (existing)
    return NextResponse.json(
      { error: "Email already in use." },
      { status: 409 }
    );

  const hashedPassword = await hash(
    password,
    parseInt(process.env.BCRYPT_SALT_ROUNDS ?? "12", 10)
  );

  await db.collection("users").insertOne({ email, hashedPassword, role: "user" });

  return NextResponse.json({ ok: true });
}
