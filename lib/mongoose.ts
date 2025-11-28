import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = (global as any).mongoose || { conn: null, promise: null };

export async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    // For mongodb+srv URIs, we don't need to append the database name with /
    // The database name should be specified as a query parameter or in the connection string
    const connectionString = (MONGODB_URI as string).includes('mongodb+srv://')
      ? MONGODB_URI
      : `${MONGODB_URI}/sales-recording-system`;
    
    cached.promise = mongoose.connect((connectionString as string), {
      bufferCommands: false,
    }).then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  (global as any).mongoose = cached;
  return cached.conn;
}
