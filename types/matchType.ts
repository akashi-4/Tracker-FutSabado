import { Player } from "./playerType";
import { Goal } from "./goalType";
import { ObjectId } from "mongodb";

export interface Match {
    _id: ObjectId;
    date: Date;
    teamA: {
        players: Player[];
        score: number;
    };
    teamB: {
        players: Player[];
        score: number;
    };
    goals: Goal[];
}

export interface MatchStats {
    match: Match;
    goals: Goal[];
}

