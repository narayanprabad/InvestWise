import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import { setupVite, serveStatic, log } from "./vite";
import { registerRoutes } from "./routes";
import MemoryStore from "memorystore";
import { dirname } from "path";
import fs from "fs";
import * as dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const app = express();
const port = process.env.PORT || 5000;
const production = process.env.NODE_ENV === "production";

const MemoryStoreSession = MemoryStore(session);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session setup
const sessionConfig = {
  store: new MemoryStoreSession({
    checkPeriod: 86400000, // prune expired entries every 24h
  }),
  secret: process.env.SESSION_SECRET || "investwise-development-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
  },
};

app.use(session(sessionConfig));

registerRoutes(app).then(async () => {
  const httpServer = createServer(app);

  if (production) {
    // Serve static assets in production
    serveStatic(app);
  } else {
    // Development mode with Vite HMR
    await setupVite(app, httpServer);
  }

  // Global error handler
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    log(`Error: ${err.message}`, "error");
    res.status(err.status || 500).json({
      message: err.message,
      error: production ? {} : err,
    });
  });

  // Start the server

  // This will be automatically changed to 'localhost' by setup.cmd for Windows compatibility
  httpServer.listen(Number(port), '0.0.0.0', () => {
    log(`Server running at http://localhost:${port}`);
  });
});