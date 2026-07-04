# PrintHub

**On-Demand Xerox & Printing Services Platform**

A full-stack marketplace connecting customers with print shops for document printing, scanning, and binding services.

[![CI/CD](https://github.com/your-org/printhub/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/printhub/actions)

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PrintHub Platform                         │
├─────────────────────────────────────────────────────────────────┤
│  Mobile App (Expo)    Web App (Next.js)    Admin Dashboard       │
│       React Native    TypeScript/React    React Admin Panel     │
├─────────────────────────────────────────────────────────────────┤
│                     API Gateway (Spring Boot)                    │
│                    REST APIs + JWT Auth + Swagger                │
├─────────────────────────────────────────────────────────────────┤
│  MySQL Database      Redis Cache        Cloudinary Storage      │
│  (22 Tables)          (Sessions)         (File Uploads)          │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Mobile** | React Native, Expo SDK 51, NativeWind |
| **Web** | Next.js 14, TypeScript, Tailwind CSS |
| **Backend** | Spring Boot 3.3, Java 21, Maven |
| **Database** | MySQL 8.0, Flyway, Redis 7 |
| **Auth** | JWT (access + refresh tokens), BCrypt |
| **Payments** | Razorpay Integration |
| **CI/CD** | GitHub Actions, Docker, EAS |

## Quick Start

```bash
# Start all services with Docker
docker-compose up -d

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
| MySQL | 3306 | Primary database |
| Redis | 6379 | Session & cache store |
| Adminer | 8081 | Database GUI |

## API Documentation

- Swagger UI: http://localhost:8080/swagger-ui.html
- OpenAPI Spec: http://localhost:8080/v3/api-docs

## Development

### Backend
```bash
cd printhub-backend
mvn spring-boot:run
mvn test  # Run tests
```

### Web Frontend
```bash
cd printhub-web
npm install
npm run dev
npm run test:run  # Unit tests
npm run test:e2e  # E2E tests
```

### Mobile App
```bash
cd printhub-mobile
npm install
npm start  # Opens Expo Dev Tools
```

## Project Structure

```
project/
├── printhub-backend/    # Spring Boot REST API
├── printhub-web/         # Next.js customer web app
├── printhub-mobile/      # Expo React Native app
├── .github/workflows/    # CI/CD pipelines
└── docker-compose.yml    # Local development stack
```

## Key Features

- Document upload (PDF, DOC, Images)
- Print configuration (paper, color, binding, lamination)
- Geolocation-based shop discovery
- Real-time order tracking
- Digital wallet with referral rewards
- Razorpay payment integration

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for production deployment guide.

## License

Proprietary - All Rights Reserved
