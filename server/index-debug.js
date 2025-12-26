// Simple server startup with debug
require("dotenv").config();
const express = require("express");
const cors = require("cors");

console.log("📦 Starting server initialization...");

// Create app immediately
const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

console.log("✅ Middleware configured");

// Basic health endpoint first
app.get("/", (req, res) => {
  res.json({ message: "Job Portal API v1.0 - Foundation MVP" });
});

console.log("✅ Health endpoint registered");

// Try to import routes (with error handling)
try {
  const authRoutes = require("./routes/auth");
  const jobRoutes = require("./routes/jobs");
  const applicationRoutes = require("./routes/applications");
  const adminRoutes = require("./routes/admin");

  app.use("/api/auth", authRoutes);
  app.use("/api/jobs", jobRoutes);
  app.use("/api/applications", applicationRoutes);
  app.use("/api/admin", adminRoutes);

  console.log("✅ All routes configured");
} catch (err) {
  console.error("❌ Route error:", err.message);
  // Continue anyway with just health endpoint
}

// Error handling
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({ error: err.message });
});

console.log("✅ Error handler configured");

// Database connection (optional for health check)
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    console.log("📡 Connecting to MongoDB...");
    await connectDB(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("⚠️  DB error (continuing anyway):", err.message);
  }

  try {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`   Ready for requests!`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
})();
