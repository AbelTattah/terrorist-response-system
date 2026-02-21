import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // Simulation Proxy - Direct connection to Python backend
  const SIMULATION_BACKEND = "http://localhost:5000";
  const simulationRoutes = ["/api/simulation", "/api/agents", "/api/events", "/api/traces", "/api/commands"];

  app.use(simulationRoutes, async (req, res, next) => {
    try {
      const { default: axios } = await import("axios");
      const targetUrl = `${SIMULATION_BACKEND}${req.originalUrl}`;

      const response = await axios({
        method: req.method,
        url: targetUrl,
        data: req.body,
        params: req.query,
        timeout: 5000, // Sufficient timeout for agent operations
      });

      res.status(response.status).json(response.data);
    } catch (error: any) {
      if (error.response) {
        // Backend replied with an error
        res.status(error.response.status).json(error.response.data);
      } else if (error.request) {
        // Backend unreachable
        res.status(503).json({
          error: "Simulation backend unreachable",
          details: "Ensure the Python simulation is running on port 5000.",
          code: "BACKEND_OFFLINE"
        });
      } else {
        res.status(500).json({ error: "Proxy internal error", message: error.message });
      }
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
