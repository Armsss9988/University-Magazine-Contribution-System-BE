const mongoose = require('mongoose');

const connectToDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Add other connection options as needed (e.g., useFindAndModify: false)
    });
    console.log('MongoDB connected successfully!');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit the application if connection fails
  }
};

module.exports = connectToDb;