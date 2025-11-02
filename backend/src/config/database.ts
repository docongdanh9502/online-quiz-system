import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quiz-system';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB đã kết nối thành công');
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ Lỗi kết nối MongoDB:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB đã ngắt kết nối');
    });
    
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Lỗi kết nối MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;