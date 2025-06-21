import { connect2DB } from '../config/db'
import { ObjectId, ClientSession } from 'mongodb'
import { Match } from '../types/matchType';

export async function getMatches() {
    const { db } = await connect2DB();
    const matches = await db.collection("matches").find().toArray();
    return matches;
}

export async function createMatch(match: Match, options?: { session: ClientSession }) {
    const { db } = await connect2DB();
    const result = await db.collection("matches").insertOne(match, options);
    return result;
}

export async function deleteMatch(id: string) {
    const { db } = await connect2DB();
    const result = await db.collection("matches").deleteOne({ 
        _id: new ObjectId(id)
    });
    return result;
} 