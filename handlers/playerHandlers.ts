import { connect2DB } from '../config/db'
import { Player } from '../types/playerType';

export async function getPlayers() {
    const { db } = await connect2DB();
    const players = await db.collection("players").find().toArray();
    return players;
}

export async function createPlayer(player: Player) {
    const { db } = await connect2DB();
    const result = await db.collection("players").insertOne(player);
    return result;
}

export async function getPlayerByName(name: string) {
    const { db } = await connect2DB();
    const player = await db.collection("players").findOne({ name });
    return player;
}

export async function deletePlayer(name: string) {
    const { db } = await connect2DB();
    const result = await db.collection("players").deleteOne({ name });
    return result;
}

export async function updatePlayer(name: string, updates: Partial<Player>) {
    const { db } = await connect2DB();
    const result = await db.collection("players").updateOne({ name }, { $set: updates });
    return result;
}