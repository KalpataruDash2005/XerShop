# PrintHub (XerShop)

**On-Demand Xerox & Printing Services Platform**

A full-stack marketplace connecting customers with print shops for document printing, scanning, and binding services.

## Architecture

```
┌──────────────────────────────────────────────┐
│                PrintHub Platform              │
├──────────────────────────────────────────────┤
│         Web App (Next.js) + Admin Dashboard   │
│            TypeScript / React / Tailwind      │
├──────────────────────────────────────────────┤
│           API Gateway (Spring Boot)           │
│          REST APIs + JWT Auth + Swagger       │
├──────────────────────────────────────────────┤
│       H2 Database (File-based) / Flyway       │
│         Local File Storage (/app/uploads)     │
└──────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Web** | Next.js 14, TypeScript, Tailwind CSS |
| **Backend** | Spring Boot 3.3, Java 21, Maven |
| **Database** | H2 (file-based), Flyway migrations |
| **Auth** | JWT (access + refresh tokens), BCrypt |
| **Storage** | Local filesystem (Docker volume) |

## Quick Start

```bash
# Start all services with Docker
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| Backend API | 8080 | Spring Boot REST API |
| Web Frontend | 3000 | Next.js customer portal |

## API Documentation

- Swagger UI: http://localhost:8080/swagger-ui.html *(if springdoc-openapi is configured)*
- H2 Console: http://localhost:8080/h2-console

## Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@printhub.com | admin123 |
| Shop Owner | shop@demo.com | admin123 |

## Promo Codes

| Code | Description |
|------|-------------|
| WELCOME20 | 20% off on first order |
| FLAT50 | Flat Rs.50 off on orders above Rs.200 |

## Project Structure

```
project/
├── printhub-backend/    # Spring Boot REST API
├── printhub-web/        # Next.js customer web app
├── .github/workflows/   # CI/CD pipelines
└── docker-compose.yml   # Local development stack
```

## Configuration

See [Changes_To_Be_Made_First.md](./Changes_To_Be_Made_First.md) for instructions on configuring:
- UPI QR Code
- WhatsApp notification number
- Twilio API credentials
