import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  console.log('Testing MongoDB connection...');
  console.log('URI:', uri ? 'URI provided' : 'No URI');
  
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log('Successfully connected to MongoDB');
    
    const db = client.db('cinemabook');
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.length);
    
    await client.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('Connection failed:', error.message);
  }
}

testConnection();