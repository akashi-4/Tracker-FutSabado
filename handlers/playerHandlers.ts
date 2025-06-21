import { connect2DB } from '../config/db'
import { ObjectId } from 'mongodb'

export async function getPlayers() {
    const { db } = await connect2DB();
    const players = await db.collection("players").find().toArray();
    return players;
}

export async function createPlayer(player: any) {
    const { db } = await connect2DB();
    const result = await db.collection("players").insertOne(player);
    return result;
}

export async function getPlayerByName(name: string) {
    const { db } = await connect2DB();
    const player = await db.collection("players").findOne({ name });
    return player;
}

export async function getPlayerStats() {
    const { db } = await connect2DB();
    // Add your stats aggregation logic here
    const stats = await db.collection("players").find().toArray();
    return stats;
} 