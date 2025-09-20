import mongoose from 'mongoose';

export async function connectToDatabase(uri: string) {
	if (!uri) {
		throw new Error('MONGO_URI environment variable is required');
	}

	try {
		mongoose.set('strictQuery', true);
		await mongoose.connect(uri);
		console.log('✅ Connected to MongoDB successfully');
		return mongoose.connection;
	} catch (error) {
		console.error('❌ Failed to connect to MongoDB:', error);
		throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}
