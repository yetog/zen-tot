# 🧘 Zen TOT - Train of Thought

An AI-powered note-taking application that captures, transcribes, and intelligently processes your thoughts from multiple sources.

[![Built with Lovable](https://img.shields.io/badge/Built%20with-Lovable-purple)](https://lovable.dev)

## ✨ Features

- **Multi-Source Capture** - Record audio, upload PDFs, paste YouTube URLs, capture web pages, and more
- **AI Transcription** - Automatic speech-to-text using Web Speech API
- **Smart Summaries** - Generate briefs, meeting minutes, and action items with AI
- **Voice Assistant** - Conversational AI agent with access to your notes (ElevenLabs)
- **Knowledge Graph** - Visualize connections between your notes
- **Semantic Search** - Find insights across all your notes (coming soon)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

### Load Demo Data
1. Go to Settings → Data tab
2. Click "Load Demo" to add sample notes
3. Explore the features!

## 🏗️ Architecture

```
Frontend (React/Vite)     Backend (FastAPI)        Services
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│ • Dashboard     │      │ • TTS Proxy     │      │ • ElevenLabs    │
│ • Note Detail   │─────▶│ • Transcription │─────▶│ • IONOS AI Hub  │
│ • Voice Agent   │      │ • File Storage  │      │ • Object Storage│
│ • Settings      │      │ • Chat API      │      │ • PostgreSQL    │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

## 📁 Project Structure

```
├── src/                      # React frontend
│   ├── components/           # UI components
│   ├── pages/               # Route pages
│   ├── services/            # API clients
│   ├── hooks/               # Custom React hooks
│   └── contexts/            # State management
├── backend/                  # FastAPI backend
│   ├── main.py              # API endpoints
│   └── sql/init.sql         # Database schema
├── docs/                     # Documentation
│   └── ionos-deployment.md  # Deployment guide
└── docker-compose.yml        # Container orchestration
```

## 🔧 Configuration

### Environment Variables

```env
# Frontend
VITE_BACKEND_URL=http://localhost:8000
VITE_IONOS_API_KEY=your_ionos_key
VITE_ELEVENLABS_AGENT_ID=your_agent_id

# Backend
ELEVENLABS_API_KEY=your_key
IONOS_API_KEY=your_key
IONOS_S3_ENDPOINT=https://s3-eu-central-1.ionoscloud.com
DATABASE_URL=postgresql://user:pass@host:5432/zentot
```

See `.env.production.example` for full configuration.

## 🚀 Deployment

Designed for IONOS DCD deployment:

```bash
# Build and deploy with Docker
docker-compose up -d
```

See `docs/ionos-deployment.md` for detailed instructions.

## 📋 Documentation

| Document | Description |
|----------|-------------|
| [HANDOFF.md](./HANDOFF.md) | Complete project handoff documentation |
| [docs/ionos-deployment.md](./docs/ionos-deployment.md) | IONOS DCD deployment guide |
| [backend/README.md](./backend/README.md) | Backend API documentation |

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend:** Python, FastAPI, PostgreSQL, pgvector
- **AI:** IONOS AI Model Hub, ElevenLabs
- **Storage:** IONOS Object Storage (S3-compatible)
- **Deployment:** Docker, Nginx, IONOS DCD

## 📊 Status

| Feature | Status |
|---------|--------|
| Dashboard & Notes | ✅ Working |
| PDF Extraction | ✅ Working |
| Voice Recording | ✅ Working |
| AI Summaries | ✅ Working |
| Voice Agent | 🔧 Needs Agent ID |
| Object Storage | 🔧 Needs Setup |
| Authentication | 📋 Planned |

## 🤝 Contributing

See [HANDOFF.md](./HANDOFF.md) for development guidelines and project context.

## 📄 License

Proprietary - All rights reserved.

---

**Built with ❤️ using [Lovable](https://lovable.dev)**
