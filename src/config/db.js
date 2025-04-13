const mongoose = require("mongoose");
const { mongoURI } = require("./config");

/**
 * Establishes a connection to the MongoDB database.
 *
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    // Connect to the MongoDB database
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("MongoDB connected successfully.");
  } catch (error) {
    // Log any errors that occur during the connection process
    console.error("MongoDB connection error:", error);
    // If running in test mode, throw error instead of exiting,
    // so that Jest can report the error properly.
    if (process.env.NODE_ENV === "test") {
      throw error;
    } else {
      // Exit the application with a status code of 1 if there is a connection error
      process.exit(1);
    }
  }
};

module.exports = connectDB;
