# Zen TOT - Product Roadmap

**Last Updated:** 2024-12-09  
**Version:** MVP Development

---

## Vision
"AI Note Taker for your Train of Thought" - Record anything, then chat with an AI that knows your notes and turns them into summaries, tasks, emails, and insights.

---

## Phase Overview

```
┌─────────────────────────────────────────────────────────────────┐
│ Phase 1: Voice Agent + Notes Context          [IN PROGRESS]    │
├─────────────────────────────────────────────────────────────────┤
│ Phase 2: Notes Processing Pipeline            [PLANNED]        │
├─────────────────────────────────────────────────────────────────┤
│ Phase 3: Backend Infrastructure               [PLANNED]        │
├─────────────────────────────────────────────────────────────────┤
│ Phase 4: Semantic Search & RAG                [PLANNED]        │
├─────────────────────────────────────────────────────────────────┤
│ Phase 5: Automations & Integrations           [FUTURE]         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Voice Agent + Notes Context 🟡
**Status:** In Progress  
**Sprint:** 001

### Goals
- ElevenLabs voice agent integration
- Pass notes context to agent
- Real-time voice conversations about notes

### Deliverables
- [x] Voice agent hook (`useVoiceAgent.ts`)
- [x] Agent ID configuration
- [x] Notes context passing via session overrides
- [ ] UI indicators for voice states
- [ ] Transcript display
- [ ] Error handling

---

## Phase 2: Notes Processing Pipeline 📋
**Status:** Planned  
**Estimated Duration:** 2-3 weeks

### Goals
Build the core capture → process → store pipeline

### Deliverables

#### 2.1 Audio/Video Transcription
- [ ] Audio file upload (mp3, m4a, wav)
- [ ] Video file upload (mp4)
- [ ] Speech-to-text via IONOS Model Hub or Whisper
- [ ] Store transcripts with timestamps

#### 2.2 PDF/Document Extraction
- [ ] PDF upload and text extraction
- [ ] Image OCR (optional)
- [ ] Document parsing and chunking

#### 2.3 Web/YouTube Processing
- [ ] YouTube URL → transcript extraction
- [ ] Web page URL → content extraction
- [ ] Metadata capture (title, thumbnail, etc.)

#### 2.4 AI Summarization
- [ ] Brief summary generation
- [ ] Bullet points extraction
- [ ] Action items detection
- [ ] Meeting minutes format

### Technical Requirements
- IONOS Object Storage for file uploads
- Processing worker/queue for async jobs
- IONOS AI Model Hub for summarization

---

## Phase 3: Backend Infrastructure 📋
**Status:** Planned  
**Estimated Duration:** 2-3 weeks

### Goals
Set up production-ready backend on IONOS

### Deliverables

#### 3.1 Database
- [ ] PostgreSQL with pgvector extension
- [ ] Schema: users, notes, transcripts, summaries, note_chunks
- [ ] Migrations and seed data

#### 3.2 Storage
- [ ] IONOS Object Storage configuration
- [ ] Pre-signed URLs for uploads
- [ ] File organization (by user, type)

#### 3.3 API Layer
- [ ] RESTful API endpoints
- [ ] Authentication (JWT)
- [ ] Rate limiting

#### 3.4 Worker Service
- [ ] Job queue (Redis + BullMQ or Celery)
- [ ] Processing workers for transcription/summarization
- [ ] Status updates and webhooks

---

## Phase 4: Semantic Search & RAG 📋
**Status:** Planned  
**Estimated Duration:** 2 weeks

### Goals
Enable intelligent search across all notes

### Deliverables
- [ ] Embedding generation for note chunks
- [ ] pgvector storage and indexing
- [ ] Semantic search API endpoint
- [ ] RAG pipeline for assistant responses
- [ ] Context-aware chat with source citations

### Technical Requirements
- IONOS AI Model Hub embedding model
- Chunking strategy for long documents
- Relevance scoring and filtering

---

## Phase 5: Automations & Integrations 📋
**Status:** Future  
**Estimated Duration:** Ongoing

### Goals
Connect Zen TOT to external tools and workflows

### Deliverables

#### 5.1 n8n Automations
- [ ] Webhook triggers for note events
- [ ] Email summary automation
- [ ] Calendar integration
- [ ] Notion sync

#### 5.2 Export Options
- [ ] Markdown export
- [ ] PDF export
- [ ] JSON export

#### 5.3 Integrations
- [ ] Google Calendar
- [ ] Google Docs
- [ ] Notion
- [ ] Slack (future)

---

## Future Considerations

### Chrome Extension
- Capture current page → send to Zen TOT
- Quick note from selection
- YouTube transcript capture

### Mobile App
- Offline recording
- Push notifications
- Quick capture widget

### Team Features
- Shared workspaces
- Collaborative notes
- Permission management

### Advanced Analytics
- Topic clustering
- Sentiment analysis
- Speaker identification

---

## Tech Stack Summary

| Component | Technology |
|-----------|------------|
| Frontend | React, Vite, Tailwind CSS, TypeScript |
| Voice | ElevenLabs Conversational AI |
| Database | PostgreSQL + pgvector |
| Storage | IONOS Object Storage |
| AI Models | IONOS AI Model Hub |
| Automations | n8n |
| TTS | ElevenLabs |
| Hosting | IONOS DCD |

---

## Success Metrics (MVP)

1. **Capture:** User can upload audio/PDF/URL and get transcript
2. **Summarize:** AI generates useful summaries and action items
3. **Chat:** Voice assistant can answer questions using note context
4. **Search:** Semantic search finds relevant notes
5. **Act:** Templates generate follow-up emails, TODOs, etc.
