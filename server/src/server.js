import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import coinRoutes from "./routes/coinRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import watchlistRoutes from "./routes/watchlistRoutes.js";
import portfolioRoutes from "./routes/portfolioRoutes.js";
import { connectDB } from "./config/db.js";
import { startPriceStream } from "./sockets/priceStream.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5001;

// app.use(
//   cors({
//     origin: "http://localhost:5173",
//   })
// );

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CryptoPulse API is running",
    endpoints: [
      "GET /api/coins",
      "GET /api/coins/:id",
      "GET /api/coins/:id/history",
      "POST /api/auth/register",
      "POST /api/auth/login",
      "GET /api/auth/me",
      "GET/POST/DELETE /api/watchlist",
      "GET/POST/PUT/DELETE /api/portfolio",
    ],
  });
});

app.use("/api/coins", coinRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/portfolio", portfolioRoutes);

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.emit("connectionStatus", {
    connected: true,
    message: "Connected to CryptoPulse real-time price stream",
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  startPriceStream(io);
});