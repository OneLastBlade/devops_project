require("./tracer");
const client = require("prom-client");
const pino = require("pino");
const express = require("express");
// nosemgrep: javascript.express.security.audit.express-check-csurf-middleware-usage
const app = express();
const logger = pino();

// Collect default metrics (CPU, memory, etc.)
client.collectDefaultMetrics();

// Custom metrics
const httpRequests = new client.Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "route", "status"],
});

const httpDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request latency in seconds",
  labelNames: ["method", "route", "status"],
  buckets: [0.1, 0.5, 1, 2, 5],
});

const errorCounter = new client.Counter({
  name: "http_errors_total",
  help: "Total HTTP errors",
  labelNames: ["method", "route", "status"],
});

// Middleware for request tracking
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;

    httpRequests.labels(req.method, route, res.statusCode).inc();
    httpDuration.labels(req.method, route, res.statusCode).observe(duration);

    if (res.statusCode >= 400) {
      errorCounter.labels(req.method, route, res.statusCode).inc();
    }

    logger.info(
      { method: req.method, url: req.url, status: res.statusCode, duration },
      "Incoming request"
    );
  });

  next();
});

app.get("/health", (req, res) => {
  res.json({ status: "UP" });
});

app.get("/hello", (req, res) => {
  res.json({ message: "Hello DevOps" });
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error(err, "Unhandled error");
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});