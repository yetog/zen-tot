# Zen TOT - Quick Reference Card

## 🚀 Getting Started (30 seconds)

```bash
npm install && npm run dev
# Go to Settings → Data → Load Demo
```

## 📍 Key URLs

| Route | Description |
|-------|-------------|
| `/` | Dashboard (All Notes) |
| `/note/:id` | Note detail view |
| `/assistant` | Voice AI assistant |
| `/settings` | Configuration |
| `/folders` | Folder management |
| `/tags` | Tag management |
| `/knowledge-graph` | Visual connections |

## 🔑 Environment Variables

```env
# Required for full features
VITE_IONOS_API_KEY=xxx          # AI chat
VITE_ELEVENLABS_AGENT_ID=xxx    # Voice agent
VITE_BACKEND_URL=xxx            # Production backend
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/services/api.ts` | API client |
| `src/contexts/NotesContext.tsx` | Notes state |
| `src/hooks/useVoiceAgent.ts` | Voice agent |
| `backend/main.py` | Backend API |
| `HANDOFF.md` | Full documentation |

## 🏗️ Architecture

```
React App → (Demo: localStorage)
React App → Backend API → PostgreSQL + S3
                      → ElevenLabs (TTS/STT)
                      → IONOS AI (Chat)
```

## ✅ Feature Status

- ✅ Notes CRUD, PDF extraction, Voice recording
- ✅ AI summaries, Chat, Knowledge graph
- 🔧 Voice Agent (needs Agent ID)
- 🔧 Object Storage (needs S3 bucket)
- ❌ Authentication (not implemented)

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Voice agent fails | Set `VITE_ELEVENLABS_AGENT_ID` |
| AI chat errors | Check `VITE_IONOS_API_KEY` |
| Notes lost | localStorage cleared; export first |

## 📚 More Docs

- `HANDOFF.md` - Complete handoff documentation
- `docs/ionos-deployment.md` - Deployment guide
- `backend/README.md` - Backend API docs
