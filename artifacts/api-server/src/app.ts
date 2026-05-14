import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import path from "path";
import pinoHttp from "pino-http";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import mongoose from "mongoose";
import { rateLimit } from "express-rate-limit";
import router from "./routes";
import { logger } from "./lib/logger";
import { autoSeed } from "./vms/seed";

const app: Express = express();

app.set("trust proxy", 1);

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

const isProd = process.env["NODE_ENV"] === "production";

const rawFrontendUrl = process.env["FRONTEND_URL"] || "";
const allowedOrigins: string[] = rawFrontendUrl
  ? rawFrontendUrl.split(",").map((o) => o.trim()).filter(Boolean)
  : ["*"];

if (isProd && !rawFrontendUrl) {
  logger.error("FRONTEND_URL is not set in production — all CORS origins are allowed. Set FRONTEND_URL=https://your-app.replit.app to lock this down.");
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' not allowed`));
      }
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Permissions-Policy", "camera=*");
  next();
});

const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts, please try again later." },
});

app.use("/api/v1/visits/request", publicLimiter);
app.use("/api/v1/visits/returning", publicLimiter);
app.use("/api/v1/mobile", publicLimiter);
app.use("/api/v1/auth/login", authLimiter);

app.use("/public", express.static(path.join(process.cwd(), "public")));

app.use("/api", router);

const httpServer = createServer(app);

const socketPath = process.env["NODE_ENV"] === "production" ? "/api/socket.io" : "/socket.io";

const io = new SocketIOServer(httpServer, {
  cors: { origin: allowedOrigins.includes("*") ? true : allowedOrigins, methods: ["GET", "POST"] },
  path: socketPath,
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
  let uri = MONGO_URI;

  if (!uri) {
    logger.warn("MONGODB_URI not set — starting in-memory MongoDB for development.");
    try {
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      const memServer = await MongoMemoryServer.create();
      uri = memServer.getUri();
      logger.info({ uri }, "In-memory MongoDB started");
    } catch (err) {
      logger.error({ err }, "Failed to start in-memory MongoDB. Set MONGODB_URI as a Replit Secret.");
      process.exit(1);
    }
  }

  try {
    await mongoose.connect(uri);
    logger.info("MongoDB connected");
    const seedEnabled = process.env["SEED_DB"] === "true";
    if (!isProd || seedEnabled) {
      await autoSeed();
    } else {
      logger.info("Production mode — skipping auto-seed. Set SEED_DB=true to seed explicitly.");
    }
    startExpiredInviteCleanup();
  } catch (err) {
    logger.error({ err }, "MongoDB connection failed — exiting");
    process.exit(1);
  }
}

async function cleanupExpiredInvites() {
  try {
    const { VmsUser } = await import("./vms/models.js");
    const result = await VmsUser.deleteMany({
      inviteToken: { $exists: true },
      inviteExpires: { $lt: new Date() },
    });
    if (result.deletedCount > 0) {
      logger.info({ count: result.deletedCount }, "Cleaned up expired pending invites");
    }
  } catch (err) {
    logger.error({ err }, "Failed to clean up expired invites");
  }
}

function startExpiredInviteCleanup() {
  cleanupExpiredInvites();
  const ONE_HOUR = 60 * 60 * 1000;
  setInterval(cleanupExpiredInvites, ONE_HOUR);
  logger.info("Expired invite cleanup scheduled (runs every hour)");
}

connectDB();

export { httpServer };
export default app;
