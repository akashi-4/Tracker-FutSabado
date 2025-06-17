import { config } from 'dotenv';
config({ path: '.env.local' });

import { MongoClient } from "mongodb";
import { hash } from "bcryptjs";

const uri = process.env.MONGO_URI;
if (!uri) throw new Error('MONGO_URI still undefined – check .env.local path');

const client = new MongoClient(uri);
await client.connect();

const db = client.db();
const email = "admin@futebolada.com";
const plain = "adminpass";

const hashedPassword = await hash(plain, 12);
await db.collection("users").deleteMany({ email });
await db.collection("users").insertOne({ email, hashedPassword, role: "admin" });

console.log("Admin inserted");
await client.close();
process.exit(0);
