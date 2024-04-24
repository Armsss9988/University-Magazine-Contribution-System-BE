const mongoose = require('mongoose');

const MAX_RETRIES = 5; // Maximum number of retries
const BASE_RETRY_DELAY = 1000; // Base retry delay (1 second)

const connectToDb = async () => {
  let retryCount = 0;

  while (retryCount < MAX_RETRIES) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        // Add other connection options as needed (e.g., useFindAndModify: false)
      });
      console.log('MongoDB connected successfully!');
      return; // Exit the function if connection is successful
    } catch (error) {
      console.error('Error connecting to MongoDB:', error.message);

      // Calculate exponential backoff delay
      const delay = BASE_RETRY_DELAY * Math.pow(2, retryCount);

      console.log(`Retrying connection in ${delay} milliseconds...`);
      await new Promise(resolve => setTimeout(resolve, delay)); // Wait before retrying
      retryCount++;
    }
  }

  // If all retries fail, exit the application
  console.error('Failed to connect to MongoDB after all attempts. Exiting...');
  process.exit(1);
};

module.exports = connectToDb;
