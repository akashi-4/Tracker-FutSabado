import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI as string;
if (!uri) throw new Error("MONGO_URI is not defined");

let client: MongoClient | null = null;

export const connect2DB = async () => {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
    console.log("Connected to MongoDB");
  }
  return client.db("futebolada");
};
