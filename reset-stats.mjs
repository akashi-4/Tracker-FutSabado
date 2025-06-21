import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), 'Tracker-FutSabado', '.env.local') });

// This script will reset all stats for all players to 0.

async function runReset() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI not found in .env file');
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB...");

    const database = client.db();
    const playersCollection = database.collection('players');

    console.log("Resetting all player stats to 0...");

    const result = await playersCollection.updateMany(
      {}, // An empty filter matches all documents
      { 
        $set: { 
          wins: 0,
          losses: 0,
          draws: 0,
          goals: 0,
          matchesPlayed: 0 
        } 
      }
    );

    console.log("--- Reset Complete ---");
    console.log(`Successfully reset stats for ${result.modifiedCount} player document(s).`);

  } catch (err) {
    console.error("An error occurred during reset:", err);
  } finally {
    await client.close();
    console.log("Disconnected from MongoDB.");
  }
}

runReset(); 