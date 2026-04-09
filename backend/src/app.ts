// app.ts - KODE LENGKAP
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// FIX SOCKET.IO CORS - HARDCODE ALL PORTS
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:3010",
      "http://localhost:3011",
      "http://localhost:3012",
      "http://localhost:3013",
      "http://localhost:3014",
      "http://127.0.0.1:3014"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
});

const PORT = Number(process.env.PORT || 7000);

const allowedOrigins = [
  "http://localhost:3010",
  "http://localhost:3011",
  "http://localhost:3012",
  "http://localhost:3013",
  "http://localhost:3014"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get("/", (_req, res) => res.json({ success: true, message: "HR-UKK API v2" }));
app.use("/api", routes);
app.use(errorHandler);

httpServer.listen(PORT, () => {
  console.log(`HR-UKK API + Socket.IO on port ${PORT}`);
});
