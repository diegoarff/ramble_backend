import 'dotenv/config';
import app from './app';
import mongoose from 'mongoose';

const PORT = process.env.PORT ?? 3000;

const connection = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

// Connect to the database before listening
connection().then(() => {
  app.listen(PORT, () => {
    console.log('listening for requests');
  });
});
