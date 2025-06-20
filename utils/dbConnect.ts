import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then(async (mongoose) => {
      // Wait for connection to be open before checking indexes
      await mongoose.connection.asPromise();
      
      try {
        // Check if companies collection exists before accessing indexes
        const db = mongoose.connection.db;
        if (!db) {
          throw new Error('Database connection not established');
        }
        
        const collections = await db.listCollections({ name: 'companies' }).toArray();
        
        if (collections.length > 0) {
          // One-time check for duplicate indexes on Company collection
          const companyCollection = mongoose.connection.collection('companies');
          const indexes = await companyCollection.indexes();
          const nameIndex = indexes.find(index => index.key && 'name' in index.key);
          if (nameIndex && nameIndex.name) {
            console.log('Dropping duplicate index on name field in companies collection', nameIndex.name);
            await companyCollection.dropIndex(nameIndex.name);
          }
        }
      } catch (error) {
        console.log('Note: Companies collection not found, will be created when first company is added');
      }
      
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect; 