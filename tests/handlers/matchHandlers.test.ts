import { getMatches, createMatch, deleteMatch, getMatchHistory } from "../../handlers/matchHandlers";
import { ObjectId } from "mongodb";

const mockDB = {
    find: jest.fn(),
    insertOne: jest.fn(),
    deleteOne: jest.fn()
};

jest.mock('../../config/db', ()=> ({
    connect2DB: jest.fn(()=> ({
        db: {
            collection: jest.fn(() => mockDB)
        }
    }))
}));

const mockMatchData = [
  {
    _id: "mock-id-1",
    date: new Date("2024-01-15"),
    teamA: {
      players: ["Player1", "Player2"],
      score: 3
    },
    teamB: {
      players: ["Player3", "Player4"], 
      score: 2
    },
    goals: []
  },
  {
    _id: "mock-id-2", 
    date: new Date("2024-01-16"),
    teamA: {
      players: ["Player5", "Player6"],
      score: 1
    },
    teamB: {
      players: ["Player7", "Player8"],
      score: 4
    },
    goals: []
  },
  {
    _id: "mock-id-3",
    date: new Date("2024-01-17"),
    teamA: {
      players: ["Player9", "Player10"],
      score: 2
    },
    teamB: { 
      players: ["Player11", "Player12"],
      score: 3
    },
    goals: []
  }
];

const newMatchNoId = {
    date: new Date("2024-01-28"),
    teamA: {players: [{name: "Joao", goals: 0, wins: 0, losses: 0, draws: 0, matchesPlayed: 0}], score: 2 },
    teamB: {players: [{name: "Jose", goals: 0, wins: 0, losses: 0, draws: 0, matchesPlayed: 0}], score: 1 },
    goals: []
}

describe('Match Handlers', () => {
    beforeEach(()=> {
        jest.clearAllMocks();
    });

    // We use mockResolvedValue to return a promise, or asynchronous
    // We use mockReturnValue when the function is synchronous
    describe('getMatches', () => {
        it('should return all matches from database', async () => {
            // Config mock for this test
            mockDB.find.mockReturnValue({
                toArray: jest.fn().mockResolvedValue(mockMatchData)
            });
            // Call the function we're testing
            const result = await getMatches();
            
            //Check if the mockDB.find was called
            expect(mockDB.find).toHaveBeenCalledTimes(1);

            // Compare results
            expect(result).toEqual(mockMatchData);
        });
        it('should return an empty array if no matches are found', async () => {
            // Config mock for this test
            mockDB.find.mockReturnValue({
                toArray: jest.fn().mockResolvedValue([])
            });
            const result = await getMatches();

            // Check that the mock was called
            expect(mockDB.find).toHaveBeenCalledTimes(1);

            // Check that the result is an empty array
            expect(result).toEqual([]);
        });
        it('should return an error if the database connection fails', async () => {
            mockDB.find.mockReturnValue({
                toArray: jest.fn().mockRejectedValue(new Error('DB Connection Error'))
            });
            // Not await because we want to test the error
            const result = getMatches();

            expect(result).rejects.toThrow('DB Connection Error');
        }); 
    });

    describe('createMatch', () => {
        it('should create a new match in database', async () => {
            // Config mock for this test
            mockDB.insertOne.mockResolvedValue({
                acknowledged: true,
                insertedId: new ObjectId('507f1f77bcf86cd799439011')
            });

            // Compare results
            const result = await createMatch(newMatchNoId);
            
            expect(mockDB.insertOne).toHaveBeenCalledWith(newMatchNoId, undefined);
            expect(result.acknowledged).toBe(true);
            expect(result.insertedId).toBeDefined();
        });
        it('should return an error if the database connection fails', async () => {
            mockDB.insertOne.mockRejectedValue(new Error('DB Connection Error'));
            // Not await because we want to test the error
            const result = createMatch(newMatchNoId);
            expect(result).rejects.toThrow('DB Connection Error');
        });
    });

    describe('deleteMatch', () => {
        it('should delete a match through the id and return mongoDB delete success', async () => {
             mockDB.deleteOne.mockResolvedValue({
                 acknowledged: true,
                 deletedCount: 1
             });
     
            const id = 'mock-id-1';
            const result = await deleteMatch(id);
    
            // Check that the mock was called
            expect(mockDB.deleteOne).toHaveBeenCalledTimes(1);

            // Manually inspect the argument passed to the mock
            const calledArg = mockDB.deleteOne.mock.calls[0][0];
            expect(calledArg._id.toString()).toBe(id);
    
            // Check the result returned
            expect(result.acknowledged).toBe(true);
            expect(result.deletedCount).toBe(1);
        });
        it('should return an error if there is no match with the id', async()=>{
            mockDB.deleteOne.mockResolvedValue({
                acknowledged: true,
                deletedCount: 0
            });

            const id = 'non-existant-id';
            const result = await deleteMatch(id);
            // Check that the mock was called
            expect(mockDB.deleteOne).toHaveBeenCalledTimes(1);

            // Manually inspect the argument passed to the mock
            const calledArg = mockDB.deleteOne.mock.calls[0][0];
            expect(calledArg._id.toString()).toBe(id);
    
            // Check the result returned
            expect(result.acknowledged).toBe(true);
            expect(result.deletedCount).toBe(0);
        });
        it('should return an error if the database connection fails', async()=>{
            mockDB.deleteOne.mockRejectedValue(new Error('DB Connection Error'));

            const id = 'mock-id-1';
            // Not await because we want to test the error
            const result = deleteMatch(id);

            expect(result).rejects.toThrow('DB Connection Error');
        });
    });
    describe('getMatchHistory', () => {
        it('should return all matches from database sorted by date', async () => {
            // Create sorted mock data (newest first)
            const sortedMockData = [...mockMatchData].sort((a, b) => b.date.getTime() - a.date.getTime());
            
            // Mock the chained methods: find().sort().toArray()
            mockDB.find.mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    toArray: jest.fn().mockResolvedValue(sortedMockData)
                })
            });
            
            const result = await getMatchHistory();
            
            // Check that find and sort were called
            expect(mockDB.find).toHaveBeenCalledTimes(1);
            expect(mockDB.find().sort).toHaveBeenCalledWith({ date: -1 });
            
            // Check the result is sorted correctly (newest first)
            expect(result).toEqual(sortedMockData);
        });

        it('should return an empty array if no matches are found', async () => {
            mockDB.find.mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    toArray: jest.fn().mockResolvedValue([])
                })
            });
            
            const result = await getMatchHistory();
            
            expect(mockDB.find).toHaveBeenCalledTimes(1);
            expect(result).toEqual([]);
        });

        it('should return an error if the database connection fails', async () => {
            mockDB.find.mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    toArray: jest.fn().mockRejectedValue(new Error('DB Connection Error'))
                })
            });
            
            const result = getMatchHistory();
            expect(result).rejects.toThrow('DB Connection Error');
        });
    });
});