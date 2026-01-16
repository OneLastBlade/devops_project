const request = require("supertest");
const app = require("../src/index");

describe("DevOps API Endpoints", () => {
    describe("GET /health", () => {
        it("should return status UP", async () => {
            const res = await request(app).get("/health");
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ status: "UP" });
        });
    });

    describe("GET /hello", () => {
        it("should return hello message", async () => {
            const res = await request(app).get("/hello");
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ message: "Hello DevOps" });
        });
    });

    describe("GET /metrics", () => {
        it("should return Prometheus metrics", async () => {
            const res = await request(app).get("/metrics");
            expect(res.status).toBe(200);
            expect(res.type).toMatch(/text\/plain/);
            expect(res.text).toContain("http_requests_total");
            expect(res.text).toContain("http_request_duration_seconds");
            expect(res.text).toContain("http_errors_total");
        });

        it("should include request count in metrics", async () => {
            await request(app).get("/hello");

            const res = await request(app).get("/metrics");
            expect(res.text).toContain("http_requests_total");
        });
    });

    describe("GET /404 - Not Found", () => {
        it("should return 404 for unknown routes", async () => {
            const res = await request(app).get("/unknown-endpoint");
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: "Not found" });
        });

        it("should increment error counter for 404", async () => {
            await request(app).get("/nonexistent");

            const metrics = await request(app).get("/metrics");
            expect(metrics.text).toContain('http_errors_total{method="GET"');
        });
    });

    describe("Request Metrics", () => {
        it("should track request method in metrics", async () => {
            await request(app).get("/hello");

            const res = await request(app).get("/metrics");
            expect(res.text).toContain('method="GET"');
        });

        it("should track response status in metrics", async () => {
            await request(app).get("/health");

            const res = await request(app).get("/metrics");
            expect(res.text).toContain('status="200"');
        });
    });
});