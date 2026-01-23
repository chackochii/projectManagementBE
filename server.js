import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js";
import indexRoutes from "./routes/index.js";
import { globalLimiter } from "./middleware/rateLimiter.js";

dotenv.config();

const app = express();

/* --------------------------------------------------
   Middleware
-------------------------------------------------- */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(globalLimiter);
app.set("trust proxy", 1);


app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
  })
);

/* --------------------------------------------------
   Routes
-------------------------------------------------- */
app.use("/api", indexRoutes);

/* --------------------------------------------------
   Health Check (IMPORTANT for Nginx / Load Balancers)
-------------------------------------------------- */
app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});


/* --------------------------------------------------
   Error Handler (prevents hanging responses)
-------------------------------------------------- */
app.use((err, _req, res, _next) => {
  console.error("UNHANDLED ERROR:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

/* --------------------------------------------------
   Server Start (DB FIRST)
-------------------------------------------------- */
const PORT = process.env.PORT || 8000;

(async () => {
  try {
    await connectDB();
    app.listen(PORT, HOST, () => {
       console.log(`✅ Server running on http://${HOST}:${PORT}`);
     });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
})();
