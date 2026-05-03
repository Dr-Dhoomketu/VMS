import express, { type Express } from "express";
import cors from "cors";
import path from "path";
import pinoHttp from "pino-http";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import mongoose from "mongoose";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

app.use("/public", express.static(path.join(process.cwd(), "public")));

app.use("/api", router);

const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  path: "/socket.io",
});

app.set("io", io);

io.on("connection", (socket) => {
  logger.info({ socketId: socket.id }, "Socket connected");
  socket.on("join_admin", () => socket.join("admin_channel"));
  socket.on("join_employee", (userId: string) => socket.join(`employee_${userId}`));
  socket.on("disconnect", () => logger.info({ socketId: socket.id }, "Socket disconnected"));
});

const MONGO_URI = process.env["MONGODB_URI"] || process.env["MONGO_URI"] || "";

async function connectDB() {
  if (!MONGO_URI) {
    logger.warn("No MONGODB_URI set — VMS routes require MongoDB. Set MONGODB_URI env var.");
    return;
  }
  try {
    await mongoose.connect(MONGO_URI);
    logger.info("MongoDB connected");
  } catch (err) {
    logger.error({ err }, "MongoDB connection failed");
  }
}

connectDB();

export { httpServer };
export default app;
