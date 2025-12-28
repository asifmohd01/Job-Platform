require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { configureCloudinary } = require("./config/cloudinary");
const errorHandler = require("./middlewares/errorHandler");
const authRoutes = require("./routes/auth");
const jobRoutes = require("./routes/jobs");
const applicationRoutes = require("./routes/applications");
const adminRoutes = require("./routes/admin");
const recruiterRoutes = require("./routes/recruiter");
const candidateProfileRoutes = require("./routes/candidateProfile");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configure Cloudinary
configureCloudinary();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/recruiter", recruiterRoutes);
app.use("/api/candidate-profile", candidateProfileRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Job Portal API v1.0 - Foundation MVP" });
});

// Error handling middleware
app.use(errorHandler);

// DB Connection & Server Start
const startServer = async () => {
  try {
    await connectDB(process.env.MONGODB_URI);
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();
