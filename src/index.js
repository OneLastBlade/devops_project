require("./tracer");
const express = require("express");
const client = require("prom-client");
const pino = require("pino");

// nosemgrep: javascript.express.security.audit.express-check-csurf-middleware-usage
const app = express();
const logger = pino();
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

const httpRequests = new client.Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
});

app.use((req, res, next) => {
  httpRequests.inc();
  logger.info({ method: req.method, url: req.url }, "Incoming request");
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

app.listen(3000, () => {
  logger.info("Server running on port 3000");
});