# Deployment Guide

## Production Deployment

### Prerequisites

1. **Server Requirements**
   - 4 CPU cores minimum
   - 8GB RAM minimum
   - 50GB SSD storage
   - Docker & Docker Compose installed

2. **External Services**
   - MySQL database (or use managed RDS/Cloud SQL)
   - Redis instance (or use managed Redis)
   - Cloudinary account (for file storage)
   - Razorpay merchant account

### Step 1: Prepare Environment

```bash
# Clone repository
git clone https://github.com/your-org/printhub.git
cd printhub

# Create production environment file
cp .env.example .env.prod
```

Edit `.env.prod` with production values:
```env
# Database
MYSQL_ROOT_PASSWORD=<secure-password>
MYSQL_DATABASE=printhub
MYSQL_USER=printhub
MYSQL_PASSWORD=<secure-password>

# Backend
SPRING_PROFILES_ACTIVE=prod
JWT_SECRET=<256-bit-secret-key>
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=<production-secret>

# Frontend
NEXT_PUBLIC_API_URL=https://api.printhub.com/api/v1
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx
```

### Step 2: Build Docker Images

```bash
# Build all images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Or build individually
docker build -t printhub-backend:latest ./printhub-backend
docker build -t printhub-web:latest ./printhub-web
```

### Step 3: Deploy Services

```bash
# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check health
docker-compose ps
docker-compose logs -f backend
```

### Step 4: Database Migrations

On first deployment:
```bash
# Run migrations manually (if not auto-run)
docker-compose exec backend mvn flyway:migrate
```

### Step 5: SSL/HTTPS Setup

```bash
# Using Certbot for Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d printhub.com -d www.printhub.com

# Or configure in nginx.conf
```

## Mobile App Deployment

### Android (EAS)

```bash
cd printhub-mobile

# Configure EAS
eas login
eas build:configure

# Build AAB for Play Store
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

### iOS (EAS)

```bash
cd printhub-mobile

# Build IPA for App Store
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

### EAS Configuration (`eas.json`)

```json
{
  "builds": {
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "simulator": false
      }
    }
  }
}
```

## Monitoring & Logging

### Health Checks
- Backend: `/actuator/health`
- Frontend: Custom health endpoint

### Log Aggregation
```bash
# View backend logs
docker-compose logs -f backend

# View web logs
docker-compose logs -f web

# Export logs
docker-compose logs --no-color > logs.txt
```

### Optional: Setup Prometheus + Grafana

Add to `docker-compose.prod.yml`:
```yaml
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin
```

## Backup Strategy

### Database Backup
```bash
# Daily backup cron
0 2 * * * docker exec printhub-mysql mysqldump -u root -p$MYSQL_ROOT_PASSWORD printhub > /backups/printhub_$(date +\%Y\%m\%d).sql
```

### Restore from Backup
```bash
docker exec -i printhub-mysql mysql -u root -p$MYSQL_ROOT_PASSWORD printhub < backup.sql
```

## Scaling Considerations

### Horizontal Scaling
```yaml
# docker-compose.prod.yml
services:
  backend:
    deploy:
      replicas: 3
```

### Load Balancing
Use Nginx or HAProxy:
```nginx
upstream backend {
  server backend-1:8080;
  server backend-2:8080;
  server backend-3:8080;
}

server {
  listen 80;
  location /api/ {
    proxy_pass http://backend;
  }
}
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check MySQL is running
   docker-compose ps mysql

   # Check credentials
   docker exec -it printhub-mysql mysql -u printhub -p
   ```

2. **JWT Token Invalid**
   - Ensure `JWT_SECRET` is same across all backend instances
   - Check token expiration settings

3. **Payment Integration Issues**
   - Verify Razorpay credentials
   - Check webhook configuration
   - Test with Razorpay test mode first

4. **Mobile App Issues**
   - Clear Metro bundler cache: `npx expo start -c`
   - Reinstall dependencies: `rm -rf node_modules && npm install`
