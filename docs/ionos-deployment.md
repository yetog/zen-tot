# Zen TOT - IONOS DCD Deployment Guide

This guide walks you through deploying Zen TOT on IONOS Data Center Designer (DCD).

## Prerequisites

- IONOS Cloud account with DCD access
- IONOS Object Storage bucket created
- IONOS AI Model Hub API key
- ElevenLabs API key (for TTS/STT)
- Domain name (optional but recommended)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                       IONOS DCD                                  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Virtual Data Center                    │   │
│  │                                                           │   │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │   │
│  │  │  Frontend   │    │   Backend   │    │  PostgreSQL │   │   │
│  │  │    VM       │───▶│     VM      │───▶│     VM      │   │   │
│  │  │  (Nginx)    │    │  (FastAPI)  │    │ (+pgvector) │   │   │
│  │  └─────────────┘    └──────┬──────┘    └─────────────┘   │   │
│  │         │                  │                              │   │
│  │         │                  ▼                              │   │
│  │         │           ┌─────────────┐                       │   │
│  │         │           │   Redis     │                       │   │
│  │         │           │   (Queue)   │                       │   │
│  │         │           └─────────────┘                       │   │
│  │         │                                                 │   │
│  └─────────│─────────────────────────────────────────────────┘   │
│            │                                                      │
│            ▼                                                      │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              IONOS Object Storage (S3)                       │ │
│  │              Bucket: zen-tot-uploads                         │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │    External Services    │
              │  • ElevenLabs (TTS/STT) │
              │  • IONOS AI Model Hub   │
              └─────────────────────────┘
```

## Step 1: Create Virtual Data Center

1. Log into IONOS DCD
2. Create a new Virtual Data Center (VDC)
3. Select your region (e.g., `de/txl` for Frankfurt)

## Step 2: Create VMs

### Frontend VM (2 vCPU, 4GB RAM)
- OS: Ubuntu 22.04 LTS
- Disk: 20GB SSD
- Public IP: Yes
- Firewall: Allow 80, 443

### Backend VM (4 vCPU, 8GB RAM)
- OS: Ubuntu 22.04 LTS
- Disk: 40GB SSD
- Public IP: Yes (or use internal IP with load balancer)
- Firewall: Allow 8000 (internal), 443 (if SSL termination here)

### Database VM (4 vCPU, 16GB RAM)
- OS: Ubuntu 22.04 LTS
- Disk: 100GB SSD
- Public IP: No (internal only)
- Firewall: Allow 5432 from Backend VM only

## Step 3: Set Up PostgreSQL with pgvector

SSH into Database VM:

```bash
# Install PostgreSQL 16
sudo apt update
sudo apt install -y postgresql-16 postgresql-16-pgvector

# Configure PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE USER zentot WITH PASSWORD 'your_secure_password';
CREATE DATABASE zentot OWNER zentot;
\c zentot
CREATE EXTENSION vector;
\q

# Allow connections from backend VM
sudo nano /etc/postgresql/16/main/pg_hba.conf
# Add: host zentot zentot 10.0.0.0/8 md5

sudo nano /etc/postgresql/16/main/postgresql.conf
# Set: listen_addresses = '*'

sudo systemctl restart postgresql
```

Run the init script:
```bash
psql -U zentot -d zentot -f backend/sql/init.sql
```

## Step 4: Set Up Object Storage

1. Go to IONOS Object Storage
2. Create bucket: `zen-tot-uploads`
3. Configure CORS:

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://your-domain.com"],
      "AllowedMethods": ["GET", "PUT", "POST"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3600
    }
  ]
}
```

4. Create access keys and note them down

## Step 5: Deploy Backend

SSH into Backend VM:

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Clone repository
git clone https://github.com/your-repo/zen-tot.git
cd zen-tot/backend

# Create environment file
cp .env.example .env
nano .env
# Fill in all values

# Build and run
docker build -t zen-tot-backend .
docker run -d \
  --name zen-tot-backend \
  --restart unless-stopped \
  -p 8000:8000 \
  --env-file .env \
  zen-tot-backend

# Check logs
docker logs -f zen-tot-backend
```

## Step 6: Deploy Frontend

SSH into Frontend VM:

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Clone repository
git clone https://github.com/your-repo/zen-tot.git
cd zen-tot

# Create production env
echo "VITE_BACKEND_URL=http://BACKEND_VM_IP:8000" > .env.production
echo "VITE_ELEVENLABS_AGENT_ID=your_agent_id" >> .env.production

# Build and run
docker build -f Dockerfile.frontend -t zen-tot-frontend .
docker run -d \
  --name zen-tot-frontend \
  --restart unless-stopped \
  -p 80:80 \
  zen-tot-frontend
```

## Step 7: Set Up SSL (Optional but Recommended)

Using Certbot with Nginx:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Step 8: Configure DNS

Point your domain to the Frontend VM's public IP:
- `your-domain.com` → Frontend VM IP
- `api.your-domain.com` → Backend VM IP (if separate)

## Monitoring & Maintenance

### Health Checks
```bash
# Backend health
curl http://backend-ip:8000/health

# Frontend health
curl http://frontend-ip/health
```

### Logs
```bash
docker logs zen-tot-backend
docker logs zen-tot-frontend
```

### Updates
```bash
# Pull latest code
git pull

# Rebuild and restart
docker build -t zen-tot-backend .
docker stop zen-tot-backend && docker rm zen-tot-backend
docker run -d --name zen-tot-backend ... (same command as before)
```

## Cost Estimate

| Resource | Spec | Monthly Cost (approx) |
|----------|------|----------------------|
| Frontend VM | 2 vCPU, 4GB | ~€15 |
| Backend VM | 4 vCPU, 8GB | ~€30 |
| Database VM | 4 vCPU, 16GB | ~€50 |
| Object Storage | 100GB | ~€5 |
| **Total** | | **~€100/month** |

## Troubleshooting

### Backend not connecting to DB
- Check firewall rules allow 5432 from backend
- Verify pg_hba.conf allows backend IP
- Test with: `psql -h DB_IP -U zentot -d zentot`

### Object Storage upload fails
- Verify CORS configuration
- Check access keys are correct
- Ensure bucket policy allows uploads

### TTS not working
- Verify ElevenLabs API key is valid
- Check backend logs for errors
- Test API key directly: `curl -H "xi-api-key: YOUR_KEY" https://api.elevenlabs.io/v1/voices`
