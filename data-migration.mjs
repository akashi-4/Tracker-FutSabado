import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), 'Tracker-FutSabado', '.env.local') });

// This script will update all player documents in your database
// that are missing the 'matchesPlayed' field and set it to 0.

async function runMigration() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI not found in .env file');
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB...");

    const database = client.db();
    const matchesCollection = database.collection('matches');

    const matchCount = await matchesCollection.countDocuments();
    console.log(`Found ${matchCount} documents in the 'matches' collection.`);

    // Find the oldest match
    const oldestMatch = await matchesCollection.findOne({}, { sort: { date: 1 } });
    console.log("--- Oldest Match ---");
    console.log(JSON.stringify(oldestMatch, null, 2));

    // Find the newest match
    const newestMatch = await matchesCollection.findOne({}, { sort: { date: -1 } });
    console.log("\n--- Newest Match ---");
    console.log(JSON.stringify(newestMatch, null, 2));

  } catch (err) {
    console.error("An error occurred:", err);
  } finally {
    await client.close();
    console.log("\nDisconnected from MongoDB.");
  }
}

runMigration(); 