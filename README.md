# DevOps API - Yessine

A production-ready Node.js REST API demonstrating DevOps best practices with observability, security, containerization, and Kubernetes deployment.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Local Development](#local-development)
- [Docker](#docker)
- [Docker Compose](#docker-compose)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Observability](#observability)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Security](#security)
- [Contributing](#contributing)

## ✨ Features

- **REST API** - Lightweight Express.js backend (< 150 lines)
- **Metrics & Observability** - Prometheus metrics, request tracing, structured logging
- **Containerization** - Docker & Docker Compose for easy deployment
- **Kubernetes Ready** - Deployment manifests for minikube/kind
- **Security** - SAST/DAST scanning, health checks, error handling
- **Testing** - Comprehensive Jest unit tests with supertest
- **CI/CD Pipeline** - GitHub Actions for automated build, test, and scan

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Runtime** | Node.js 18 |
| **Framework** | Express.js 4.19.0 |
| **Metrics** | Prometheus Client 15.1.0 |
| **Logging** | Pino 9.0.0 |
| **Tracing** | OpenTelemetry SDK |
| **Testing** | Jest 29.7.0 + Supertest 6.3.3 |
| **Containerization** | Docker + Docker Compose |
| **Orchestration** | Kubernetes (minikube/kind) |
| **Monitoring** | Prometheus + Grafana |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker (optional, for containerization)
- Docker Compose (optional, for full stack)
- kubectl + minikube/kind (optional, for Kubernetes)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/devops-api.git
cd devops-api

# Install dependencies
npm install

# Run tests
npm test

# Start the server
npm start
```

The API will be available at `http://localhost:3000`

## 📱 Local Development

### Running the API

```bash
npm start
```

Server starts on port 3000. Check health:

```bash
curl http://localhost:3000/health
# Response: {"status":"UP"}
```

### Development with Auto-reload (Optional)

Install nodemon for development:

```bash
npm install --save-dev nodemon
# Add to package.json scripts: "dev": "nodemon src/index.js"
npm run dev
```

## 🐳 Docker

### Build Docker Image

```bash
# Build the image
docker build -t devops-api:latest .

# Run container
docker run -p 3000:3000 devops-api:latest

# Access the API
curl http://localhost:3000/health
```

### Docker Image Specifications

- **Base Image**: `node:18-alpine` (lightweight, ~150MB)
- **Working Directory**: `/app`
- **Exposed Port**: `3000`
- **Health Check**: Configured in docker-compose.yml

## 🐘 Docker Compose

Run the complete observability stack with Prometheus and Grafana:

```bash
# Start all services
docker-compose up -d

# Verify services
docker-compose ps

# Stop services
docker-compose down
```

### Services

| Service | Port | Purpose |
|---------|------|---------|
| **API** | 3000 | REST API endpoints |
| **Prometheus** | 9090 | Metrics database & query engine |
| **Grafana** | 3001 | Visualization dashboard |

### Docker Compose Usage

```bash
# View logs
docker-compose logs -f app

# Scale services (not applicable for this demo)
docker-compose up --scale api=3

# Clean up volumes
docker-compose down -v
```

## ☸️ Kubernetes Deployment

### Prerequisites

- minikube or kind installed
- kubectl configured

### Deployment Steps

```bash
# 1. Start minikube/kind
minikube start
# or
kind create cluster --name devops-api

# 2. Build and load image
docker build -t devops-api:latest .
minikube image load devops-api:latest

# 3. Deploy to Kubernetes
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/configmap.yaml

# 4. Verify deployment
kubectl get pods -n devops-api
kubectl get svc -n devops-api

# 5. Port forward to access
kubectl port-forward svc/devops-api 3000:3000 -n devops-api

# 6. Test the API
curl http://localhost:3000/health
```

### Kubernetes Manifests

The `k8s/` directory contains:

- `namespace.yaml` - Isolated namespace for the app
- `deployment.yaml` - Pod deployment with resource limits and health checks
- `service.yaml` - ClusterIP service for internal routing
- `configmap.yaml` - Configuration management

## 📊 Observability

### Metrics

Prometheus metrics are exposed at `/metrics`:

```bash
curl http://localhost:3000/metrics
```

**Available Metrics:**

- `http_requests_total` - Total HTTP requests (counter with method, route, status labels)
- `http_request_duration_seconds` - Request latency distribution (histogram)
- `http_errors_total` - Total HTTP errors (counter)
- `process_*` - Node.js process metrics (CPU, memory, etc.)

### Grafana Dashboard

1. Open Grafana: `http://localhost:3001`
2. Login: `admin` / `admin`
3. Add Prometheus datasource: `http://prometheus:9090`
4. Import or create dashboards using the metrics above

### Logging

Structured logs are emitted in JSON format via Pino:

```json
{
  "level": 30,
  "time": 1768593036145,
  "pid": 37036,
  "method": "GET",
  "url": "/health",
  "status": 200,
  "duration": 0.004,
  "msg": "Incoming request"
}
```

View logs:

```bash
# Local development
npm start | jq .

# Docker
docker-compose logs -f app | jq .
```

### Tracing

OpenTelemetry is configured for distributed tracing. Tracing data can be sent to:

- Jaeger
- Zipkin
- Datadog

(Requires additional configuration)

## 📡 API Endpoints

### Health Check

```bash
GET /health

# Response (200 OK):
{"status":"UP"}
```

### Hello Endpoint

```bash
GET /hello

# Response (200 OK):
{"message":"Hello DevOps"}
```

### Metrics Endpoint

```bash
GET /metrics

# Response (200 OK):
# Prometheus text format metrics
```

### 404 Handler

```bash
GET /unknown

# Response (404 Not Found):
{"error":"Not found"}
```

## 🧪 Testing

### Run Tests

```bash
npm test
```

**Test Coverage:**

- ✅ Health check endpoint
- ✅ Hello endpoint
- ✅ Metrics endpoint
- ✅ 404 error handling
- ✅ Request metrics tracking
- ✅ Error counter increments
- ✅ Status code tracking

### Test Results

```
PASS  test/app.test.js
  DevOps API Endpoints
    GET /health
      ✓ should return status UP
    GET /hello
      ✓ should return hello message
    GET /metrics
      ✓ should return Prometheus metrics
      ✓ should include request count in metrics
    GET /404 - Not Found
      ✓ should return 404 for unknown routes
      ✓ should increment error counter for 404
    Request Metrics
      ✓ should track request method in metrics
      ✓ should track response status in metrics

Test Suites: 1 passed, 1 total
Tests:       8 passed, 8 total
```

## 🔒 Security

### SAST (Static Application Security Testing)

Semgrep scans for security issues:

```bash
# Manual scan
semgrep --config=.semgrep.yml src/
```

### DAST (Dynamic Application Security Testing)

OWASP ZAP scans the deployed API in CI/CD pipeline.

### Best Practices Implemented

✅ Input validation with status code checks  
✅ Error handling with try-catch patterns  
✅ Security headers via middleware  
✅ Structured logging for security events  
✅ Health checks for availability monitoring  
✅ Resource limits in Kubernetes  
✅ Non-root user in Docker (Alpine base)

## 📝 Project Structure

```
.
├── src/
│   ├── index.js          # Main Express application
│   └── tracer.js         # OpenTelemetry configuration
├── test/
│   └── app.test.js       # Jest unit tests
├── k8s/
│   ├── namespace.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   └── configmap.yaml
├── Dockerfile            # Docker image definition
├── docker-compose.yml    # Multi-container setup
├── prometheus.yml        # Prometheus configuration
├── package.json          # Node.js dependencies
├── .github/workflows/
│   └── ci.yml           # GitHub Actions CI/CD
├── .semgrep.yml         # SAST configuration
└── README.md            # This file
```

## 🔄 GitHub Workflow

### Branch Strategy

```
feature/enhanced-observability  ->  PR  ->  Code Review  ->  main
feature/improve-test-coverage   ->  PR  ->  Code Review  ->  main
feature/kubernetes-manifests    ->  PR  ->  Code Review  ->  main
```

### Creating a PR

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and test: `npm test`
3. Commit: `git commit -m "feat: description"`
4. Push: `git push -u origin feature/your-feature`
5. Open PR on GitHub with description and test evidence

## 🚀 CI/CD Pipeline

The GitHub Actions pipeline (`/.github/workflows/ci.yml`) automatically:

1. ✅ Runs on push to `main` and `feature/*` branches
2. ✅ Installs dependencies
3. ✅ Runs unit tests (Jest)
4. ✅ Executes SAST scanning (Semgrep)
5. ✅ Builds Docker image
6. 🔄 (Future) Pushes to Docker Registry
7. 🔄 (Future) Runs DAST scanning
8. 🔄 (Future) Deploys to Kubernetes

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com)
- [Prometheus Client](https://github.com/siimon/prom-client)
- [OpenTelemetry JS](https://opentelemetry.io/docs/instrumentation/js/)
- [Jest Documentation](https://jestjs.io)
- [Kubernetes Documentation](https://kubernetes.io/docs)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

## 📄 License

MIT

## 👤 Author

Yessine

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes and test
4. Submit a pull request
5. Wait for code review

---

**Happy DevOpsing!** 🚀
