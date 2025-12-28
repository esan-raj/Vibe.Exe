import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import generateRoutes from "./routes/generate.ts";

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || "5000", 10);

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.use("/api", generateRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "Monument Story Generator API is running!" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});