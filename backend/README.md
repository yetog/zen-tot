# Zen TOT Backend

This is the backend API for Zen TOT, designed to run on IONOS DCD.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       IONOS DCD                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │  Frontend   │───▶│   Backend   │───▶│  IONOS Object       │  │
│  │  (Nginx)    │    │  (FastAPI)  │    │  Storage (S3)       │  │
│  └─────────────┘    └──────┬──────┘    └─────────────────────┘  │
│                            │                                     │
│                            ▼                                     │
│                     ┌─────────────┐                              │
│                     │  PostgreSQL │                              │
│                     │  + pgvector │                              │
│                     └─────────────┘                              │
│                                                                  │
│  External APIs:                                                  │
│  • ElevenLabs (TTS/STT)                                         │
│  • IONOS AI Model Hub                                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Quick Start (Development)

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env
# Edit .env with your API keys

# Run development server
uvicorn main:app --reload --port 8000
```

## API Endpoints

### Health Check
```
GET /health
```

### Text-to-Speech (ElevenLabs Proxy)
```
POST /api/tts
Content-Type: application/json

{
  "text": "Hello, world!",
  "voiceId": "EXAVITQu4vr4xnSDxMaL",
  "model": "eleven_multilingual_v2"
}
```

### Audio Transcription
```
POST /api/transcribe
Content-Type: multipart/form-data

audio: <audio file>
```

### Chat (IONOS AI Model Hub)
```
POST /api/chat
Content-Type: application/json

{
  "messages": [
    {"role": "user", "content": "Hello!"}
  ]
}
```

### File Upload (Pre-signed URL)
```
POST /api/storage/upload-url
Content-Type: application/json

{
  "filename": "document.pdf",
  "contentType": "application/pdf"
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ELEVENLABS_API_KEY` | ElevenLabs API key for TTS/STT | Yes |
| `IONOS_API_KEY` | IONOS AI Model Hub key | Yes |
| `IONOS_S3_ENDPOINT` | IONOS Object Storage endpoint | Yes |
| `IONOS_S3_ACCESS_KEY` | S3 access key | Yes |
| `IONOS_S3_SECRET_KEY` | S3 secret key | Yes |
| `IONOS_S3_BUCKET` | S3 bucket name | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `CORS_ORIGINS` | Allowed CORS origins | No |

## Docker Deployment

```bash
# Build image
docker build -t zen-tot-backend .

# Run container
docker run -p 8000:8000 --env-file .env zen-tot-backend
```

## IONOS DCD Deployment

1. **Create a VM** (Ubuntu 22.04 recommended)
2. **Install Docker**
3. **Set up firewall rules** (allow port 8000 or use reverse proxy)
4. **Configure Object Storage bucket**
5. **Set up PostgreSQL** (managed or self-hosted)
6. **Deploy using Docker**

See `docs/ionos-deployment.md` for detailed instructions.
