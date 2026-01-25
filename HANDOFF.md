# 🧘 Zen TOT - Handoff Documentation

**Project Name:** Zen TOT (Train of Thought)  
**Version:** 1.0.0-beta  
**Last Updated:** December 2024  
**Status:** MVP Ready for IONOS Deployment

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Current State](#current-state)
3. [Architecture](#architecture)
4. [File Structure](#file-structure)
5. [Key Features](#key-features)
6. [Configuration & Secrets](#configuration--secrets)
7. [Local Development](#local-development)
8. [Deployment Guide](#deployment-guide)
9. [Known Issues & Limitations](#known-issues--limitations)
10. [Roadmap](#roadmap)
11. [Troubleshooting](#troubleshooting)

---

## 📖 Project Overview

Zen TOT is an **AI-powered note-taking application** inspired by HyNote. It allows users to:

- **Capture** notes from multiple sources (audio, video, PDF, YouTube, web URLs, images, text)
- **Transcribe** audio/video automatically using Web Speech API or ElevenLabs STT
- **Summarize** content using AI (IONOS Model Hub)
- **Chat** with an AI assistant that has context from all notes (semantic search)
- **Voice interact** with a conversational AI agent (ElevenLabs Voice Agent)

### Target Infrastructure
- **Hosting:** IONOS DCD (Data Center Designer)
- **Object Storage:** IONOS S3-compatible storage
- **AI:** IONOS AI Model Hub + ElevenLabs
- **Database:** PostgreSQL with pgvector for semantic search

---

## ✅ Current State

### What's Working (Frontend Demo Mode)

| Feature | Status | Notes |
|---------|--------|-------|
| Dashboard / All Notes | ✅ Working | Cards, search, filters |
| New Note Modal | ✅ Working | 8 capture types |
| PDF Text Extraction | ✅ Working | Uses pdf.js |
| Voice Recording | ✅ Working | Web Speech API (live only) |
| Note Detail Page | ✅ Working | Transcript, AI templates |
| Folders & Tags | ✅ Working | CRUD operations |
| Knowledge Graph | ✅ Working | D3.js visualization |
| AI Chat | ✅ Working | IONOS Model Hub |
| Assistant Page | ✅ Working | Voice agent UI |
| Settings Page | ✅ Working | System status display |
| Dark Theme | ✅ Working | Default theme |
| Demo Notes | ✅ Working | Load via Settings > Data |

### What Needs Configuration

| Feature | Status | Required Setup |
|---------|--------|----------------|
| ElevenLabs Voice Agent | 🔧 Needs Agent ID | Create agent in ElevenLabs dashboard |
| ElevenLabs TTS | 🔧 Needs API Key | Add `ELEVENLABS_API_KEY` secret |
| IONOS Object Storage | 🔧 Needs S3 Bucket | Create bucket, set CORS, add credentials |
| PostgreSQL Database | 🔧 Needs Setup | Run `backend/sql/init.sql` |
| User Authentication | ❌ Not Implemented | Needs JWT auth system |
| Server-side Transcription | 🔧 Backend Ready | Deploy backend, configure ElevenLabs STT |

### Data Persistence
- **Current:** Browser localStorage (notes, folders, tags)
- **Target:** PostgreSQL database via backend API

---

## 🏗️ Architecture

### Current (Demo Mode)
```
┌─────────────────────────────────────────────────────────────┐
│                     BROWSER (React App)                      │
├─────────────────────────────────────────────────────────────┤
│  • Notes stored in localStorage                              │
│  • Direct API calls to IONOS AI Model Hub                   │
│  • Web Speech API for live transcription                    │
│  • ElevenLabs Voice Agent (needs Agent ID)                  │
└─────────────────────────────────────────────────────────────┘
```

### Target (Production on IONOS)
```
┌─────────────────────────────────────────────────────────────────┐
│                       IONOS DCD                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │  Frontend   │───▶│   Backend   │───▶│  IONOS Object       │  │
│  │  (Nginx)    │    │  (FastAPI)  │    │  Storage (S3)       │  │
│  │  Port 80    │    │  Port 8000  │    │  zen-tot-uploads    │  │
│  └─────────────┘    └──────┬──────┘    └─────────────────────┘  │
│                            │                                     │
│                            ▼                                     │
│  ┌─────────────┐    ┌─────────────┐                              │
│  │   Redis     │    │  PostgreSQL │                              │
│  │  (Queue)    │    │ + pgvector  │                              │
│  └─────────────┘    └─────────────┘                              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │    External Services    │
              │  • ElevenLabs TTS/STT   │
              │  • IONOS AI Model Hub   │
              └─────────────────────────┘
```

---

## 📁 File Structure

### Frontend (React/TypeScript/Vite)

```
src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── NewNoteModal.tsx       # Note creation with 8 capture types
│   ├── VoiceTranscriptMessage.tsx  # Styled voice transcript messages
│   ├── SystemStatus.tsx       # API configuration status display
│   ├── AITemplatesPanel.tsx   # AI-powered templates (summary, action items)
│   ├── NoteChat.tsx           # Per-note chat interface
│   ├── VoiceAgent.tsx         # ElevenLabs voice agent component
│   ├── SourcePreview.tsx      # Audio/PDF/video preview
│   └── ...
├── pages/
│   ├── Dashboard.tsx          # Main notes list (All Notes)
│   ├── NoteDetail.tsx         # Single note view with tabs
│   ├── Assistant.tsx          # Voice assistant page
│   ├── Settings.tsx           # Configuration page
│   ├── Folders.tsx            # Folder management
│   ├── Tags.tsx               # Tag management
│   ├── KnowledgeGraph.tsx     # D3 visualization
│   └── Landing.tsx            # Marketing landing page
├── services/
│   ├── api.ts                 # ⭐ Centralized API client (new)
│   ├── storageService.ts      # ⭐ File storage abstraction (new)
│   ├── notesService.ts        # Notes CRUD (localStorage)
│   ├── ionosAI.ts             # IONOS Model Hub client
│   ├── ttsService.ts          # ElevenLabs TTS client
│   ├── pdfProcessor.ts        # PDF.js text extraction
│   ├── noteProcessingService.ts  # AI processing pipeline
│   └── ...
├── contexts/
│   ├── NotesContext.tsx       # Notes state management
│   └── FileContext.tsx        # File uploads state
├── hooks/
│   ├── useVoiceAgent.ts       # ElevenLabs voice agent hook
│   ├── useAudioCapture.ts     # Web Speech API recording
│   ├── useElevenLabs.ts       # TTS hook
│   └── ...
├── types/
│   ├── note.ts                # Note, Folder, Tag types
│   └── ...
└── data/
    ├── demoNotes.ts           # Demo notes for testing
    └── ...
```

### Backend (FastAPI/Python)

```
backend/
├── main.py                    # ⭐ FastAPI server (TTS, transcribe, chat, storage)
├── requirements.txt           # Python dependencies
├── Dockerfile                 # Container build
├── .env.example               # Environment template
├── README.md                  # Backend documentation
└── sql/
    └── init.sql               # ⭐ PostgreSQL + pgvector schema
```

### Deployment Configuration

```
├── docker-compose.yml         # ⭐ Full stack orchestration
├── Dockerfile.frontend        # Frontend container (multi-stage Nginx)
├── nginx.conf                 # Nginx configuration
├── .env.production.example    # Production environment template
└── docs/
    ├── ionos-deployment.md    # ⭐ Step-by-step IONOS deployment guide
    └── work-sessions/
        └── 2024-12-20-ionos-production-setup.md  # Implementation notes
```

### Legacy Python Files (from Gradio version)

```
# These are from an earlier Gradio-based version - NOT USED by current React app
app.py                         # Gradio application (legacy)
mcp/                           # MCP server implementation (legacy)
services/                      # Python services (legacy)
ui/                            # Gradio UI (legacy)
core/                          # Core utilities (legacy)
```

---

## 🎯 Key Features

### 1. Note Capture (8 Types)
| Type | Implementation | Status |
|------|----------------|--------|
| Audio Recording | Web Speech API (live) | ✅ Working |
| Audio Upload | File upload + backend STT | 🔧 Backend needed |
| Video | File upload | ✅ Working (no transcription) |
| PDF | pdf.js extraction | ✅ Working |
| YouTube URL | Metadata fetch (no transcript) | ⚠️ Partial |
| Web URL | Basic fetch | ⚠️ Basic |
| Image | Upload + display | ✅ Working (no OCR) |
| Text | Direct input | ✅ Working |

### 2. AI Processing
- **Summarization:** Brief, bulleted, meeting minutes styles
- **Action Items:** Extract tasks from transcript
- **Templates:** Follow-up email, quiz generation, custom prompts
- **Chat:** Context-aware Q&A about note content

### 3. Voice Assistant
- **ElevenLabs Voice Agent:** Conversational AI with notes context
- **Context Preview:** Shows which notes are available to the agent
- **Transcript Display:** Timestamped messages with user/agent styling

### 4. Organization
- **Folders:** Create, rename, delete folders
- **Tags:** Color-coded tags with note counts
- **Search:** Full-text search across notes
- **Filters:** By type, folder, tag, starred status

---

## 🔐 Configuration & Secrets

### Environment Variables

#### Frontend (.env or Vite config)
```env
# Backend API (when deployed)
VITE_BACKEND_URL=https://api.your-domain.com

# IONOS AI (can be frontend or backend)
VITE_IONOS_API_KEY=your_ionos_jwt_token

# ElevenLabs Voice Agent
VITE_ELEVENLABS_AGENT_ID=your_agent_id

# IONOS Object Storage (for pre-signed URL info)
VITE_IONOS_S3_ENDPOINT=https://s3-eu-central-1.ionoscloud.com
VITE_IONOS_S3_BUCKET=zen-tot-uploads
```

#### Backend (.env)
```env
# ElevenLabs (KEEP SERVER-SIDE ONLY)
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# IONOS AI Model Hub
IONOS_API_KEY=your_ionos_jwt_token

# IONOS Object Storage
IONOS_S3_ENDPOINT=https://s3-eu-central-1.ionoscloud.com
IONOS_S3_ACCESS_KEY=your_access_key
IONOS_S3_SECRET_KEY=your_secret_key
IONOS_S3_BUCKET=zen-tot-uploads

# PostgreSQL
DATABASE_URL=postgresql://user:password@host:5432/zentot

# Security
JWT_SECRET=your_super_secret_jwt_key
CORS_ORIGINS=https://your-domain.com
```

### API Keys Required

| Service | Purpose | Where to Get |
|---------|---------|--------------|
| IONOS AI Model Hub | Chat, summaries | [IONOS Cloud Console](https://cloud.ionos.com/) |
| ElevenLabs | TTS, STT, Voice Agent | [ElevenLabs Dashboard](https://elevenlabs.io/) |
| IONOS Object Storage | File uploads | [IONOS Cloud Console](https://cloud.ionos.com/) |

### Creating ElevenLabs Voice Agent

1. Go to [ElevenLabs](https://elevenlabs.io/) → Conversational AI
2. Create new Agent
3. Set system prompt:
   ```
   You are Zen, a helpful assistant for Zen TOT. You help users 
   understand and work with their notes. You have access to the 
   user's notes database and can answer questions about their content.
   ```
4. Copy the Agent ID → Add as `VITE_ELEVENLABS_AGENT_ID`

---

## 💻 Local Development

### Prerequisites
- Node.js 18+ (or Bun)
- Python 3.11+ (for backend)
- PostgreSQL 16+ with pgvector (for full features)

### Frontend Only (Demo Mode)
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

### With Backend
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys
uvicorn main:app --reload --port 8000
```

### Testing Demo Features
1. Go to Settings → Data tab
2. Click "Load Demo" to add sample notes
3. Go to Assistant to test voice agent
4. Go to All Notes to see demo notes

---

## 🚀 Deployment Guide

### Quick Reference

See `docs/ionos-deployment.md` for detailed step-by-step instructions.

### Summary

1. **Create IONOS VDC** with 3 VMs (frontend, backend, database)
2. **Set up PostgreSQL** with pgvector extension
3. **Create Object Storage bucket** with CORS configuration
4. **Deploy backend** using Docker
5. **Deploy frontend** using Docker + Nginx
6. **Configure DNS** to point to frontend VM
7. **Set up SSL** with Let's Encrypt

### Docker Commands
```bash
# Build and run with Docker Compose
docker-compose up -d

# Or individually:
docker build -f Dockerfile.frontend -t zen-tot-frontend .
docker build -f backend/Dockerfile -t zen-tot-backend backend/

docker run -d -p 80:80 zen-tot-frontend
docker run -d -p 8000:8000 --env-file .env zen-tot-backend
```

### Estimated Costs (IONOS)
| Resource | Spec | Monthly |
|----------|------|---------|
| Frontend VM | 2 vCPU, 4GB | ~€15 |
| Backend VM | 4 vCPU, 8GB | ~€30 |
| Database VM | 4 vCPU, 16GB | ~€50 |
| Object Storage | 100GB | ~€5 |
| **Total** | | **~€100** |

---

## ⚠️ Known Issues & Limitations

### Current Limitations

1. **No User Authentication**
   - All notes are public/single-user
   - Need to implement JWT auth

2. **YouTube Transcription**
   - Only fetches video metadata
   - No actual transcript extraction (YouTube API restrictions)

3. **Image OCR**
   - Images can be uploaded but no text extraction
   - Would need Tesseract.js or cloud OCR

4. **Audio File Transcription**
   - Web Speech API only works for live recording
   - Uploaded audio files need backend STT (ElevenLabs scribe_v1)

5. **Semantic Search**
   - Database schema is ready with pgvector
   - Embedding generation not yet implemented

6. **Mobile Responsiveness**
   - Basic responsive design
   - Not optimized for mobile-first

### Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Web Speech API may have issues

---

## 🗺️ Roadmap

### Phase 1: Production Ready (Current Sprint)
- [x] Create backend API skeleton
- [x] Add IONOS Object Storage integration
- [x] Create Docker deployment configs
- [x] Add system status component
- [ ] Configure ElevenLabs Voice Agent
- [ ] Deploy to IONOS DCD

### Phase 2: Core Features
- [ ] User authentication (JWT)
- [ ] Server-side audio transcription
- [ ] YouTube transcript extraction (via proxy)
- [ ] Image OCR

### Phase 3: Enhanced AI
- [ ] Embedding generation for semantic search
- [ ] Cross-note insights
- [ ] Smart tagging suggestions
- [ ] Action item tracking

### Phase 4: Collaboration
- [ ] Multi-user support
- [ ] Shared folders
- [ ] Real-time collaboration
- [ ] Team workspaces

### Phase 5: Extensions
- [ ] Chrome extension
- [ ] Mobile app (React Native)
- [ ] Slack/Teams integration
- [ ] Zapier/n8n workflows

---

## 🔧 Troubleshooting

### Common Issues

#### "Voice agent not working"
- Check `VITE_ELEVENLABS_AGENT_ID` is set
- Verify ElevenLabs API key is valid
- Check browser console for errors

#### "Notes not saving"
- Check localStorage is not full (5MB limit)
- Check console for quota exceeded errors
- Consider clearing old notes

#### "PDF extraction fails"
- Ensure PDF is not password-protected
- Check PDF is text-based (not scanned image)
- Verify pdf.js worker is loading

#### "AI chat returns errors"
- Verify IONOS API key is valid
- Check API quota/limits
- Look for CORS errors in console

#### "Build fails"
```bash
# Clear cache and reinstall
rm -rf node_modules
rm package-lock.json
npm install
npm run build
```

### Debug Tools

- **System Status:** Settings → AI tab shows service status
- **Console Logs:** Check browser dev tools
- **Network Tab:** Verify API calls are succeeding
- **Demo Mode:** Load demo notes to test features

---

## 📞 Contact & Resources

### Documentation
- `docs/ionos-deployment.md` - Deployment guide
- `docs/work-sessions/` - Development session notes
- `backend/README.md` - Backend API docs

### Key Files to Review
- `src/services/api.ts` - Centralized API client
- `src/hooks/useVoiceAgent.ts` - Voice agent implementation
- `src/contexts/NotesContext.tsx` - Notes state management
- `backend/main.py` - Backend API endpoints

---

**Document Version:** 1.0  
**Created:** December 2024  
**For:** Agent/Developer Handoff
