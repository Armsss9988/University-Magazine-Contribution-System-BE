const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://Armsss:1111@cluster0.ue0t0f4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", { useUnifiedTopology: true });
const connectToDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      
      // Add other connection options as needed (e.g., useFindAndModify: false)
    });
    console.log('MongoDB connected successfully!');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit the application if connection fails
  }
};

module.exports = connectToDb;

