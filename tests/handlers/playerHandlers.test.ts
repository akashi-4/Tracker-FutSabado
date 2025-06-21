import { getPlayers, createPlayer, getPlayerByName, deletePlayer, updatePlayer } from "../../handlers/playerHandlers";
import { ObjectId } from "mongodb";

const mockDB = {
    find: jest.fn(),
    insertOne: jest.fn(),
    deleteOne: jest.fn(),
    updateOne: jest.fn(),
    findOne: jest.fn()
};

jest.mock('../../config/db', ()=> ({
    connect2DB: jest.fn(()=> ({
        db: {
            collection: jest.fn(() => mockDB)
        }
    }))
}));

const mockPlayerData = [
    {
        name: "Player1",
        goals: 10,
        wins: 10,
        losses: 5,
        draws: 0,
        matchesPlayed: 15,
    },
    {
        name: "Player2",
        goals: 20,
        wins: 8,
        losses: 7,
        draws: 0,
        matchesPlayed: 15,
    }
];

const newPlayer = {
    name: "Player3",
    goals: 15,
    wins: 12,
    losses: 3,
    draws: 0,
    matchesPlayed: 15
};

describe('Player Handlers', () => {
    beforeEach(()=> {
        jest.clearAllMocks();
    });
    
    describe('getPlayers', () => {
        it('should return all players from database', async () => {
            mockDB.find.mockReturnValue({
                toArray: jest.fn().mockResolvedValue(mockPlayerData)
            });
            const result = await getPlayers();
            expect(mockDB.find).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockPlayerData);
        });
        it('should return an empty array if no players are found', async () => {
            mockDB.find.mockReturnValue({
                toArray: jest.fn().mockResolvedValue([])
            });
            const result = await getPlayers();
            expect(mockDB.find).toHaveBeenCalledTimes(1);
            expect(result).toEqual([]);
        });
        it('should return an error if the database connection fails', async () => {
            mockDB.find.mockReturnValue({
                toArray: jest.fn().mockRejectedValue(new Error('DB Connection Error'))
            });
            const result = getPlayers();
            expect(result).rejects.toThrow('DB Connection Error');
        });
    });

    describe('createPlayer', () => {
        it('should create a new player in database', async () => {
            mockDB.insertOne.mockResolvedValue({
                acknowledged: true,
                insertedId: new ObjectId("507f1f77bcf86cd799439011")
            });
            const result = await createPlayer(newPlayer);
            expect(mockDB.insertOne).toHaveBeenCalledWith(newPlayer);   
            expect(result.acknowledged).toBe(true);
            expect(result.insertedId).toBeDefined();
        });
        it('should return an error if the database connection fails', async () => {
            mockDB.insertOne.mockRejectedValue(new Error('DB Connection Error'));
            const result = createPlayer(newPlayer);
            expect(result).rejects.toThrow('DB Connection Error');
        });
    });

    describe('getPlayerByName', () => {
        it('should return player by name', async () => {
            mockDB.findOne.mockResolvedValue(mockPlayerData[0]);
            const result = await getPlayerByName("Player1");
            expect(mockDB.findOne).toHaveBeenCalledWith({ name: "Player1" });
            expect(result).toEqual(mockPlayerData[0]);
        });
        it('should return null if player not found', async () => {
            mockDB.findOne.mockResolvedValue(null);
            const result = await getPlayerByName("Player4");
            expect(mockDB.findOne).toHaveBeenCalledWith({ name: "Player4" });
            expect(result).toBeNull();
        });
        it('should return an error if the database connection fails', async () => {
            mockDB.findOne.mockRejectedValue(new Error('DB Connection Error'));
            const result = getPlayerByName("Player1");
            expect(result).rejects.toThrow('DB Connection Error');
        });
    });
    describe('deletePlayer', () => {
        it('should delete a player from database', async () => {
            mockDB.deleteOne.mockResolvedValue({
                acknowledged: true,
                deletedCount: 1
            });
            const result = await deletePlayer("Player1");
            expect(mockDB.deleteOne).toHaveBeenCalledWith({ name: "Player1" });
            expect(result.acknowledged).toBe(true);
            expect(result.deletedCount).toBe(1);
        });
        it('should return an error if the database connection fails', async () => {
            mockDB.deleteOne.mockRejectedValue(new Error('DB Connection Error'));
            const result = deletePlayer("Player1");
            expect(result).rejects.toThrow('DB Connection Error');
        });
        it('should return an error if the player is not found', async () => {
            mockDB.deleteOne.mockResolvedValue({
                acknowledged: true,
                deletedCount: 0
            });
            const result = await deletePlayer("Player4");
            expect(result.acknowledged).toBe(true);
            expect(result.deletedCount).toBe(0);
        });
    });
    describe('updatePlayer', () => {
        it('should update a player in database', async () => {
            mockDB.updateOne.mockResolvedValue({
                acknowledged: true,
                modifiedCount: 1
            });
            const result = await updatePlayer("Player1", { goals: 15 });
            expect(mockDB.updateOne).toHaveBeenCalledWith({ name: "Player1" }, { $set: { goals: 15 } });
            expect(result.acknowledged).toBe(true);
            expect(result.modifiedCount).toBe(1);
        });
        it('should return an error if the database connection fails', async () => {
            mockDB.updateOne.mockRejectedValue(new Error('DB Connection Error'));
            const result = updatePlayer("Player1", { goals: 15 });
            expect(result).rejects.toThrow('DB Connection Error');
        });
        it('should return an error if the player is not found', async () => {
            mockDB.updateOne.mockResolvedValue({
                acknowledged: true,
                modifiedCount: 0
            });
            const result = await updatePlayer("Player4", { goals: 15 });
            expect(result.acknowledged).toBe(true);
            expect(result.modifiedCount).toBe(0);
        });
    });
});
