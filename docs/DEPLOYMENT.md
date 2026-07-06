# Deployment Guide

## Production Deployment

### Prerequisites

1. **Server Requirements**
   - 2 CPU cores minimum
   - 4GB RAM minimum
   - 20GB SSD storage
   - Docker & Docker Compose installed

### Step 1: Clone and Configure

```bash
git clone https://github.com/your-org/printhub.git
cd printhub
```

### Step 2: Configure Environment

Edit `docker-compose.yml` or create a production override:

```yaml
services:
  backend:
    environment:
      SPRING_PROFILES_ACTIVE: prod
      JWT_SECRET: <256-bit-secret-key>
      RAZORPAY_KEY_ID: rzp_live_xxxxx
      RAZORPAY_KEY_SECRET: <production-secret>
```

### Step 3: Deploy

```bash
docker-compose up -d --build

# Check health
docker-compose ps
docker-compose logs -f
```

### Step 4: SSL/HTTPS Setup (Optional)

Use a reverse proxy (Nginx/Caddy) in front of port 3000 to enable HTTPS.

## Monitoring & Logging

### Health Checks
- Backend: `/actuator/health`
- Frontend: Custom health endpoint

### Logging
```bash
docker-compose logs -f backend
docker-compose logs -f web
docker-compose logs --no-color > logs.txt
```

## Backup Strategy

### Database Backup
```bash
docker exec printhub-backend sh -c "cp /app/db/* /backups/"
```

### Uploads Backup
```bash
docker run --rm -v uploads-data:/data -v $(pwd)/backups:/backups alpine tar czf /backups/uploads-$(date +%Y%m%d).tar.gz -C /data .
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check backend is healthy
   docker inspect printhub-backend --format='{{.State.Health.Status}}'
   ```

2. **JWT Token Invalid**
   - Ensure `JWT_SECRET` is consistent across restarts
   - Check token expiration settings

3. **File Upload Issues**
   - Verify `uploads-data` volume is mounted
   - Check disk space
   - Supported types: PDF, JPG, PNG, DOCX (max 50MB)

4. **Container Won't Start**
   ```bash
   docker-compose logs backend
   docker-compose logs web
   ```
