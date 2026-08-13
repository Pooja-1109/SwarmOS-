const mongoose = require("mongoose");
const dns = require("dns");

// Force IPv4 first to prevent Windows DNS SRV IPv6 query timeouts (querySrv ETIMEOUT)
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

const connectDB = async (retries = 5, delayMs = 3000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Connecting to MongoDB (Attempt ${attempt}/${retries})...`);
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 15000,
        family: 4,
      });

      console.log("✅ MongoDB Connected Successfully");
      return;
    } catch (error) {
      console.error(`❌ MongoDB Connection Attempt ${attempt} Failed:`, error.message);
      if (attempt < retries) {
        console.log(`Retrying in ${delayMs / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        console.error("❌ All MongoDB connection retries exhausted. Check internet connection or MongoDB Atlas cluster accessibility.");
      }
    }
  }
};

module.exports = connectDB;