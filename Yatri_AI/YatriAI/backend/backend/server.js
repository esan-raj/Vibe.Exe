import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import generateRoute from "./routes/generate.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));

app.use("/api", generateRoute);

app.listen(5000, () => {
  console.log("Backend running on port 5000");
});
