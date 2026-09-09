import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/brewtech';
    await mongoose.connect(connStr);
    console.log('MongoDB успішно підключено');
  } catch (error) {
    console.error('Помилка підключення до БД:', error);
    process.exit(1);
  }
};