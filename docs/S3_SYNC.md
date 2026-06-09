# S3 Sync System

Zen ToT uses IONOS Object Storage (S3-compatible) for real-time data persistence. Every note, folder, and tag syncs automatically to the cloud.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │     │   Backend API   │     │   IONOS S3      │
│   (React)       │────▶│   (FastAPI)     │────▶│   zen-tot-data  │
│                 │     │   Port 8017     │     │                 │
│ syncService.ts  │     │   main.py       │     │ users/default/  │
│ notesService.ts │     │   v2.0.0        │     │   ├── folders/  │
└─────────────────┘     └─────────────────┘     │   ├── unfiled/  │
                                                │   ├── tags.json │
                                                │   └── exports/  │
                                                └─────────────────┘
```

## S3 Bucket Structure

```
zen-tot-data/
└── users/
    └── default/                     # User namespace (scalable to multi-user)
        ├── folders/
        │   └── {folder_id}/
        │       ├── metadata.json    # Folder name, created date, note count
        │       └── notes/
        │           └── {note_id}/
        │               ├── note.json    # Full note content
        │               └── files/       # Attached files (audio, images, etc)
        │                   └── {file_id}.mp3
        ├── unfiled/
        │   └── notes/               # Notes not assigned to a folder
        │       └── {note_id}/
        │           └── note.json
        ├── tags.json                # All tags with colors and counts
        ├── uploads/                 # Orphan files (attached later)
        │   └── 2026/06/02/
        │       └── {file_id}.pdf
        └── exports/                 # Timestamped full exports
            └── 2026-06-02_193000.json
```

## Real-Time Sync

Every data operation triggers an automatic S3 sync:

| Action | Local | S3 |
|--------|-------|-----|
| Create note | localStorage | PUT `/api/sync/notes/{id}` |
| Update note | localStorage | PUT `/api/sync/notes/{id}` |
| Delete note | localStorage | DELETE `/api/sync/notes/{id}` |
| Create folder | localStorage | PUT `/api/sync/folders/{id}` |
| Delete folder | localStorage | DELETE `/api/sync/folders/{id}` |
| Create/delete tag | localStorage | PUT `/api/sync/tags` |

### Offline Support

- Sync operations are non-blocking (async)
- Failed syncs are queued in `pendingSync` map
- Queue flushes when connection restores
- Data always available locally via localStorage

## API Endpoints

### Health & Stats

```bash
# Check backend health
GET /health
# Response: { status, version, services: { s3, ionos_ai, elevenlabs }, buckets }

# Get storage stats
GET /api/stats
# Response: { notes, folders, files, totalObjects }
```

### Note Sync

```bash
# Sync a note (create or update)
PUT /api/sync/notes/{note_id}
Body: Note object

# Delete a note
DELETE /api/sync/notes/{note_id}?folder_id={optional}

# Get a single note
GET /api/sync/notes/{note_id}?folder_id={optional}
```

### Folder Sync

```bash
# Sync a folder
PUT /api/sync/folders/{folder_id}
Body: Folder object

# Delete folder and all its notes
DELETE /api/sync/folders/{folder_id}

# List all folders
GET /api/sync/folders
```

### Tag Sync

```bash
# Sync all tags
PUT /api/sync/tags
Body: Tag[] array

# Get all tags
GET /api/sync/tags
```

### Full Sync

```bash
# Upload everything to S3
POST /api/sync/full
Body: { notes: Note[], folders: Folder[], tags: Tag[] }

# Download everything from S3
GET /api/sync/full
# Response: { notes, folders, tags, retrievedAt }
```

### File Storage

```bash
# Get presigned upload URL
POST /api/storage/upload-url
Body: { filename, contentType, noteId?, folderId? }
# Response: { uploadUrl, fileUrl, downloadUrl, fileKey, fileId }

# Get presigned download URL
GET /api/storage/download-url/{file_key}
# Response: { downloadUrl }
```

### Export

```bash
# Create timestamped export
GET /api/export
# Response: Full data export + saves to S3

# List all exports
GET /api/exports
# Response: { exports: [{ key, filename }] }
```

## Frontend Integration

### syncService.ts

The sync service manages all S3 communication:

```typescript
import { syncService } from '@/services/syncService';

// Check status
syncService.isEnabled();   // Backend configured?
syncService.isConnected(); // Online?
syncService.getPendingCount(); // Queued syncs

// Manual sync
await syncService.syncNote(note);
await syncService.deleteNote(noteId, folderId);
await syncService.syncFolder(folder);
await syncService.syncTags(tags);
await syncService.fullSync({ notes, folders, tags });
await syncService.fetchAllData();
await syncService.getStats();
await syncService.exportData();
```

### notesService.ts

The notes service automatically calls syncService:

```typescript
import {
  createNote,      // Auto-syncs
  updateNote,      // Auto-syncs
  deleteNote,      // Auto-syncs
  syncAllToCloud,  // Manual full sync
  restoreFromCloud,// Restore from S3
  getSyncStatus    // Check sync state
} from '@/services/notesService';
```

## Configuration

### Backend (.env)

```env
# IONOS Object Storage
IONOS_S3_ENDPOINT=https://s3.us-central-1.ionoscloud.com
IONOS_S3_ACCESS_KEY=your_access_key
IONOS_S3_SECRET_KEY=your_secret_key

# IONOS AI (for chat/summaries)
IONOS_API_KEY=your_jwt_token

# Optional
ELEVENLABS_API_KEY=your_key
CORS_ORIGINS=https://zaylegend.com,http://localhost:3017
```

### Frontend (.env)

```env
VITE_BACKEND_URL=https://zaylegend.com/zen-tot/api
```

## Deployment

### Backend Container

```bash
cd backend
docker build -t zen-tot-api .
docker run -d \
  --name zen-tot-api \
  --restart unless-stopped \
  -p 8017:8000 \
  --env-file .env \
  zen-tot-api
```

### Nginx Config

```nginx
# Frontend
location /zen-tot/ {
    proxy_pass http://127.0.0.1:3017/;
    proxy_set_header Host $host;
}

# Backend API
location /zen-tot/api/ {
    proxy_pass http://127.0.0.1:8017/;
    proxy_set_header Host $host;
    proxy_read_timeout 300s;
    client_max_body_size 100M;
}
```

## Accessing Your Data

### Via API

```bash
# Get all data
curl https://zaylegend.com/zen-tot/api/api/sync/full

# Get stats
curl https://zaylegend.com/zen-tot/api/api/stats

# Export snapshot
curl https://zaylegend.com/zen-tot/api/api/export
```

### Via Python

```python
import boto3
from botocore.config import Config

s3 = boto3.client(
    's3',
    endpoint_url='https://s3.us-central-1.ionoscloud.com',
    aws_access_key_id='YOUR_KEY',
    aws_secret_access_key='YOUR_SECRET',
    config=Config(signature_version='s3v4')
)

# List all notes
response = s3.list_objects_v2(
    Bucket='zen-tot-data',
    Prefix='users/default/'
)

for obj in response.get('Contents', []):
    if obj['Key'].endswith('/note.json'):
        print(obj['Key'])

# Get a specific note
note = s3.get_object(
    Bucket='zen-tot-data',
    Key='users/default/folders/abc123/notes/xyz789/note.json'
)
content = json.loads(note['Body'].read())
```

## Future Enhancements

- [ ] Multi-user support (user auth + namespaces)
- [ ] Conflict resolution (timestamp-based merge)
- [ ] Real-time sync via WebSockets
- [ ] Incremental sync (only changed items)
- [ ] RAG integration with Black Hole AI
- [ ] Mobile app sync

## Troubleshooting

### Sync not working?

1. Check backend health: `curl /zen-tot/api/health`
2. Verify S3 credentials in backend `.env`
3. Check browser console for sync errors
4. Verify `VITE_BACKEND_URL` in frontend `.env`

### Data not persisting?

1. Check localStorage (backup always works)
2. Verify S3 bucket exists: `zen-tot-data`
3. Check API stats: `GET /api/stats`

### Offline mode?

Data saves to localStorage immediately. When back online, pending syncs flush automatically.
