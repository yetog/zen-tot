"""
Zen TOT Backend API
FastAPI server with real-time S3 sync
"""

import os
import json
import uuid
import httpx
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Configuration
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
IONOS_API_KEY = os.getenv("IONOS_API_KEY", "")
IONOS_S3_ENDPOINT = os.getenv("IONOS_S3_ENDPOINT", "")
IONOS_S3_ACCESS_KEY = os.getenv("IONOS_S3_ACCESS_KEY", "")
IONOS_S3_SECRET_KEY = os.getenv("IONOS_S3_SECRET_KEY", "")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

# Buckets
DATA_BUCKET = "zen-tot-data"  # Dedicated bucket for structured data
FILES_BUCKET = "zen-tot-data"  # Same bucket, files/ prefix

# Initialize FastAPI
app = FastAPI(
    title="Zen TOT API",
    description="Backend API for Zen TOT with real-time S3 sync",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize S3 client
s3_client = None
if IONOS_S3_ENDPOINT and IONOS_S3_ACCESS_KEY and IONOS_S3_SECRET_KEY:
    s3_client = boto3.client(
        's3',
        endpoint_url=IONOS_S3_ENDPOINT,
        aws_access_key_id=IONOS_S3_ACCESS_KEY,
        aws_secret_access_key=IONOS_S3_SECRET_KEY,
        config=Config(signature_version='s3v4'),
        region_name='us-central-1'
    )
    print(f"✅ S3 client initialized for {IONOS_S3_ENDPOINT}")
else:
    print("⚠️ S3 not configured")


# ============ Pydantic Models ============

class TTSRequest(BaseModel):
    text: str
    voiceId: Optional[str] = "EXAVITQu4vr4xnSDxMaL"
    model: Optional[str] = "eleven_multilingual_v2"
    speed: Optional[float] = 1.0


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    model: Optional[str] = "meta-llama/Meta-Llama-3.1-8B-Instruct"
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 500


class Note(BaseModel):
    id: str
    title: str
    type: str  # audio, video, pdf, youtube, web, text, image
    status: str  # processing, ready, error
    createdAt: str
    updatedAt: str
    sourceUrl: Optional[str] = None
    storageKey: Optional[str] = None
    thumbnailUrl: Optional[str] = None
    duration: Optional[float] = None
    pageCount: Optional[int] = None
    transcript: Optional[str] = None
    extractedText: Optional[str] = None
    summary: Optional[str] = None
    actionItems: Optional[List[str]] = None
    bulletedNotes: Optional[str] = None
    meetingMinutes: Optional[str] = None
    followUpEmail: Optional[str] = None
    quizContent: Optional[str] = None
    chatInsights: Optional[List[str]] = None
    analysis: Optional[str] = None
    folderId: Optional[str] = None
    tags: Optional[List[str]] = []
    starred: Optional[bool] = False
    inKnowledgeBase: Optional[bool] = False
    metadata: Optional[Dict[str, Any]] = None


class Folder(BaseModel):
    id: str
    name: str
    createdAt: str
    noteCount: Optional[int] = 0


class Tag(BaseModel):
    id: str
    name: str
    color: Optional[str] = None
    noteCount: Optional[int] = 0


class SyncRequest(BaseModel):
    notes: Optional[List[Note]] = []
    folders: Optional[List[Folder]] = []
    tags: Optional[List[Tag]] = []


class FileUploadRequest(BaseModel):
    filename: str
    contentType: str
    noteId: Optional[str] = None
    folderId: Optional[str] = None


# ============ S3 Helpers ============

def get_user_path(user_id: str = "default") -> str:
    """Get base path for user data"""
    return f"users/{user_id}"


def save_json_to_s3(key: str, data: Any) -> bool:
    """Save JSON data to S3"""
    if not s3_client:
        return False
    try:
        s3_client.put_object(
            Bucket=DATA_BUCKET,
            Key=key,
            Body=json.dumps(data, indent=2, default=str),
            ContentType='application/json'
        )
        return True
    except ClientError as e:
        print(f"S3 save error: {e}")
        return False


def load_json_from_s3(key: str) -> Optional[Any]:
    """Load JSON data from S3"""
    if not s3_client:
        return None
    try:
        response = s3_client.get_object(Bucket=DATA_BUCKET, Key=key)
        return json.loads(response['Body'].read().decode('utf-8'))
    except ClientError as e:
        if e.response['Error']['Code'] == 'NoSuchKey':
            return None
        print(f"S3 load error: {e}")
        return None


def delete_from_s3(key: str) -> bool:
    """Delete object from S3"""
    if not s3_client:
        return False
    try:
        s3_client.delete_object(Bucket=DATA_BUCKET, Key=key)
        return True
    except ClientError as e:
        print(f"S3 delete error: {e}")
        return False


def list_s3_keys(prefix: str) -> List[str]:
    """List all keys with given prefix"""
    if not s3_client:
        return []
    try:
        keys = []
        paginator = s3_client.get_paginator('list_objects_v2')
        for page in paginator.paginate(Bucket=DATA_BUCKET, Prefix=prefix):
            for obj in page.get('Contents', []):
                keys.append(obj['Key'])
        return keys
    except ClientError as e:
        print(f"S3 list error: {e}")
        return []


# ============ Health Check ============

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "2.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "elevenlabs": bool(ELEVENLABS_API_KEY),
            "ionos_ai": bool(IONOS_API_KEY),
            "s3": s3_client is not None,
        },
        "buckets": {
            "data": DATA_BUCKET,
        }
    }


# ============ Note Sync ============

@app.put("/api/sync/notes/{note_id}")
async def sync_note(note_id: str, note: Note):
    """Sync a single note to S3 (create or update)"""
    if not s3_client:
        raise HTTPException(status_code=503, detail="S3 not configured")

    user_path = get_user_path()
    folder_path = f"folders/{note.folderId}" if note.folderId else "unfiled"
    note_key = f"{user_path}/{folder_path}/notes/{note_id}/note.json"

    note_data = note.dict()
    note_data['syncedAt'] = datetime.utcnow().isoformat()

    if save_json_to_s3(note_key, note_data):
        return {"success": True, "key": note_key, "syncedAt": note_data['syncedAt']}
    raise HTTPException(status_code=500, detail="Failed to sync note")


@app.delete("/api/sync/notes/{note_id}")
async def delete_note(note_id: str, folder_id: Optional[str] = None):
    """Delete a note from S3"""
    if not s3_client:
        raise HTTPException(status_code=503, detail="S3 not configured")

    user_path = get_user_path()
    folder_path = f"folders/{folder_id}" if folder_id else "unfiled"
    note_prefix = f"{user_path}/{folder_path}/notes/{note_id}/"

    # Delete note and all its files
    keys = list_s3_keys(note_prefix)
    for key in keys:
        delete_from_s3(key)

    return {"success": True, "deleted": len(keys)}


@app.get("/api/sync/notes/{note_id}")
async def get_note(note_id: str, folder_id: Optional[str] = None):
    """Get a single note from S3"""
    if not s3_client:
        raise HTTPException(status_code=503, detail="S3 not configured")

    user_path = get_user_path()

    # If folder_id provided, look directly
    if folder_id:
        note_key = f"{user_path}/folders/{folder_id}/notes/{note_id}/note.json"
        data = load_json_from_s3(note_key)
        if data:
            return data

    # Otherwise search in unfiled
    note_key = f"{user_path}/unfiled/notes/{note_id}/note.json"
    data = load_json_from_s3(note_key)
    if data:
        return data

    raise HTTPException(status_code=404, detail="Note not found")


# ============ Folder Sync ============

@app.put("/api/sync/folders/{folder_id}")
async def sync_folder(folder_id: str, folder: Folder):
    """Sync a folder to S3"""
    if not s3_client:
        raise HTTPException(status_code=503, detail="S3 not configured")

    user_path = get_user_path()
    folder_key = f"{user_path}/folders/{folder_id}/metadata.json"

    folder_data = folder.dict()
    folder_data['syncedAt'] = datetime.utcnow().isoformat()

    if save_json_to_s3(folder_key, folder_data):
        return {"success": True, "key": folder_key}
    raise HTTPException(status_code=500, detail="Failed to sync folder")


@app.delete("/api/sync/folders/{folder_id}")
async def delete_folder(folder_id: str):
    """Delete a folder and all its notes from S3"""
    if not s3_client:
        raise HTTPException(status_code=503, detail="S3 not configured")

    user_path = get_user_path()
    folder_prefix = f"{user_path}/folders/{folder_id}/"

    keys = list_s3_keys(folder_prefix)
    for key in keys:
        delete_from_s3(key)

    return {"success": True, "deleted": len(keys)}


@app.get("/api/sync/folders")
async def list_folders():
    """List all folders"""
    if not s3_client:
        raise HTTPException(status_code=503, detail="S3 not configured")

    user_path = get_user_path()
    prefix = f"{user_path}/folders/"

    folders = []
    keys = list_s3_keys(prefix)

    for key in keys:
        if key.endswith('/metadata.json'):
            data = load_json_from_s3(key)
            if data:
                folders.append(data)

    return {"folders": folders}


# ============ Tag Sync ============

@app.put("/api/sync/tags")
async def sync_tags(tags: List[Tag]):
    """Sync all tags to S3"""
    if not s3_client:
        raise HTTPException(status_code=503, detail="S3 not configured")

    user_path = get_user_path()
    tags_key = f"{user_path}/tags.json"

    tags_data = {
        "tags": [t.dict() for t in tags],
        "syncedAt": datetime.utcnow().isoformat()
    }

    if save_json_to_s3(tags_key, tags_data):
        return {"success": True, "count": len(tags)}
    raise HTTPException(status_code=500, detail="Failed to sync tags")


@app.get("/api/sync/tags")
async def get_tags():
    """Get all tags"""
    if not s3_client:
        raise HTTPException(status_code=503, detail="S3 not configured")

    user_path = get_user_path()
    tags_key = f"{user_path}/tags.json"

    data = load_json_from_s3(tags_key)
    return data or {"tags": []}


# ============ Full Sync ============

@app.post("/api/sync/full")
async def full_sync(data: SyncRequest):
    """Full sync: upload all notes, folders, and tags"""
    if not s3_client:
        raise HTTPException(status_code=503, detail="S3 not configured")

    user_path = get_user_path()
    results = {"notes": 0, "folders": 0, "tags": 0, "errors": []}

    # Sync folders first
    for folder in data.folders or []:
        try:
            folder_key = f"{user_path}/folders/{folder.id}/metadata.json"
            folder_data = folder.dict()
            folder_data['syncedAt'] = datetime.utcnow().isoformat()
            save_json_to_s3(folder_key, folder_data)
            results["folders"] += 1
        except Exception as e:
            results["errors"].append(f"Folder {folder.id}: {str(e)}")

    # Sync notes
    for note in data.notes or []:
        try:
            folder_path = f"folders/{note.folderId}" if note.folderId else "unfiled"
            note_key = f"{user_path}/{folder_path}/notes/{note.id}/note.json"
            note_data = note.dict()
            note_data['syncedAt'] = datetime.utcnow().isoformat()
            save_json_to_s3(note_key, note_data)
            results["notes"] += 1
        except Exception as e:
            results["errors"].append(f"Note {note.id}: {str(e)}")

    # Sync tags
    if data.tags:
        tags_key = f"{user_path}/tags.json"
        tags_data = {
            "tags": [t.dict() for t in data.tags],
            "syncedAt": datetime.utcnow().isoformat()
        }
        save_json_to_s3(tags_key, tags_data)
        results["tags"] = len(data.tags)

    return results


@app.get("/api/sync/full")
async def get_all_data():
    """Get all synced data from S3"""
    if not s3_client:
        raise HTTPException(status_code=503, detail="S3 not configured")

    user_path = get_user_path()

    # Get folders
    folders = []
    folder_keys = list_s3_keys(f"{user_path}/folders/")
    for key in folder_keys:
        if key.endswith('/metadata.json'):
            data = load_json_from_s3(key)
            if data:
                folders.append(data)

    # Get notes from all folders
    notes = []
    all_keys = list_s3_keys(f"{user_path}/")
    for key in all_keys:
        if '/notes/' in key and key.endswith('/note.json'):
            data = load_json_from_s3(key)
            if data:
                notes.append(data)

    # Get tags
    tags_data = load_json_from_s3(f"{user_path}/tags.json")
    tags = tags_data.get("tags", []) if tags_data else []

    return {
        "notes": notes,
        "folders": folders,
        "tags": tags,
        "retrievedAt": datetime.utcnow().isoformat()
    }


# ============ File Uploads ============

@app.post("/api/storage/upload-url")
async def get_upload_url(request: FileUploadRequest):
    """Generate pre-signed URL for file upload"""
    if not s3_client:
        raise HTTPException(status_code=503, detail="S3 not configured")

    user_path = get_user_path()
    file_ext = os.path.splitext(request.filename)[1]
    file_id = str(uuid.uuid4())

    # Build path based on context
    if request.noteId:
        folder_path = f"folders/{request.folderId}" if request.folderId else "unfiled"
        file_key = f"{user_path}/{folder_path}/notes/{request.noteId}/files/{file_id}{file_ext}"
    else:
        # Orphan file (will be attached later)
        file_key = f"{user_path}/uploads/{datetime.utcnow().strftime('%Y/%m/%d')}/{file_id}{file_ext}"

    try:
        upload_url = s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': DATA_BUCKET,
                'Key': file_key,
                'ContentType': request.contentType,
            },
            ExpiresIn=3600
        )

        file_url = f"{IONOS_S3_ENDPOINT}/{DATA_BUCKET}/{file_key}"

        # Generate download URL (presigned for private bucket)
        download_url = s3_client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': DATA_BUCKET,
                'Key': file_key,
            },
            ExpiresIn=86400  # 24 hours
        )

        return {
            "uploadUrl": upload_url,
            "fileUrl": file_url,
            "downloadUrl": download_url,
            "fileKey": file_key,
            "fileId": file_id,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate upload URL: {str(e)}")


@app.get("/api/storage/download-url/{file_key:path}")
async def get_download_url(file_key: str):
    """Generate pre-signed download URL"""
    if not s3_client:
        raise HTTPException(status_code=503, detail="S3 not configured")

    try:
        download_url = s3_client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': DATA_BUCKET,
                'Key': file_key,
            },
            ExpiresIn=86400
        )
        return {"downloadUrl": download_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ Export ============

@app.get("/api/export")
async def export_data():
    """Export all data as a single JSON file"""
    if not s3_client:
        raise HTTPException(status_code=503, detail="S3 not configured")

    # Get all data
    data = await get_all_data()

    # Save export to S3
    user_path = get_user_path()
    export_key = f"{user_path}/exports/{datetime.utcnow().strftime('%Y-%m-%d_%H%M%S')}.json"

    export_data = {
        **data,
        "exportedAt": datetime.utcnow().isoformat(),
        "version": "2.0.0"
    }

    save_json_to_s3(export_key, export_data)

    return export_data


@app.get("/api/exports")
async def list_exports():
    """List all exports"""
    if not s3_client:
        raise HTTPException(status_code=503, detail="S3 not configured")

    user_path = get_user_path()
    keys = list_s3_keys(f"{user_path}/exports/")

    exports = []
    for key in keys:
        if key.endswith('.json'):
            exports.append({
                "key": key,
                "filename": key.split('/')[-1],
            })

    return {"exports": exports}


# ============ Stats ============

@app.get("/api/stats")
async def get_stats():
    """Get storage stats"""
    if not s3_client:
        raise HTTPException(status_code=503, detail="S3 not configured")

    user_path = get_user_path()
    all_keys = list_s3_keys(f"{user_path}/")

    notes_count = sum(1 for k in all_keys if '/notes/' in k and k.endswith('/note.json'))
    folders_count = sum(1 for k in all_keys if k.endswith('/metadata.json'))
    files_count = sum(1 for k in all_keys if '/files/' in k)

    return {
        "notes": notes_count,
        "folders": folders_count,
        "files": files_count,
        "totalObjects": len(all_keys),
    }


# ============ Text-to-Speech ============

@app.post("/api/tts")
async def generate_tts(request: TTSRequest):
    """Generate speech from text using ElevenLabs API"""
    if not ELEVENLABS_API_KEY:
        raise HTTPException(status_code=503, detail="ElevenLabs API key not configured")

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://api.elevenlabs.io/v1/text-to-speech/{request.voiceId}?output_format=mp3_44100_128",
            headers={
                "xi-api-key": ELEVENLABS_API_KEY,
                "Content-Type": "application/json",
            },
            json={
                "text": request.text,
                "model_id": request.model,
                "voice_settings": {
                    "stability": 0.5,
                    "similarity_boost": 0.75,
                    "speed": request.speed,
                }
            },
            timeout=30.0
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"ElevenLabs API error: {response.text}"
            )

        return Response(content=response.content, media_type="audio/mpeg")


# ============ AI Chat ============

@app.post("/api/chat")
async def chat(request: ChatRequest):
    """Chat with IONOS AI Model Hub"""
    if not IONOS_API_KEY:
        raise HTTPException(status_code=503, detail="IONOS API key not configured")

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://openai.inference.de-txl.ionos.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {IONOS_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": request.model,
                "messages": [msg.dict() for msg in request.messages],
                "temperature": request.temperature,
                "max_tokens": request.max_tokens,
            },
            timeout=30.0
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"IONOS AI error: {response.text}"
            )

        data = response.json()
        return {
            "content": data["choices"][0]["message"]["content"],
            "usage": data.get("usage"),
        }


# ============ YouTube Transcripts ============

@app.get("/api/youtube/transcript/{video_id}")
async def get_youtube_transcript(video_id: str, lang: str = "en"):
    """Fetch transcript/captions for a YouTube video using yt-dlp"""
    import subprocess
    import tempfile
    import re

    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            # Use yt-dlp to download subtitles
            url = f"https://www.youtube.com/watch?v={video_id}"
            output_path = f"{tmpdir}/subs"

            # Try auto-generated subtitles first, then manual
            cmd = [
                "yt-dlp",
                "--skip-download",
                "--write-auto-sub",
                "--write-sub",
                "--sub-lang", lang,
                "--sub-format", "vtt",
                "--output", output_path,
                url
            ]

            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)

            # Find the subtitle file
            import glob
            vtt_files = glob.glob(f"{tmpdir}/*.vtt")

            if not vtt_files:
                # Try with 'en' as fallback
                if lang != "en":
                    cmd[5] = "en"
                    subprocess.run(cmd, capture_output=True, text=True, timeout=30)
                    vtt_files = glob.glob(f"{tmpdir}/*.vtt")

            if not vtt_files:
                raise HTTPException(status_code=404, detail="No subtitles available for this video")

            # Parse VTT file
            with open(vtt_files[0], 'r', encoding='utf-8') as f:
                vtt_content = f.read()

            # Extract text and timestamps from VTT
            segments = []
            full_text_parts = []

            # VTT format: timestamp --> timestamp\ntext
            pattern = r'(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})\n(.*?)(?=\n\n|\Z)'
            matches = re.findall(pattern, vtt_content, re.DOTALL)

            seen_text = set()  # Deduplicate repeated lines
            for start, end, text in matches:
                # Clean up text (remove tags, extra whitespace)
                clean_text = re.sub(r'<[^>]+>', '', text).strip()
                clean_text = re.sub(r'\n', ' ', clean_text)

                if clean_text and clean_text not in seen_text:
                    seen_text.add(clean_text)
                    full_text_parts.append(clean_text)

                    # Parse timestamp to seconds
                    h, m, s = start.split(':')
                    start_sec = int(h) * 3600 + int(m) * 60 + float(s)

                    h, m, s = end.split(':')
                    end_sec = int(h) * 3600 + int(m) * 60 + float(s)

                    segments.append({
                        "text": clean_text,
                        "start": start_sec,
                        "duration": end_sec - start_sec
                    })

            full_text = ' '.join(full_text_parts)

            # Determine if auto-generated
            is_generated = '.en.vtt' in vtt_files[0] or 'auto' in vtt_files[0].lower()

            return {
                "videoId": video_id,
                "language": lang,
                "isGenerated": is_generated,
                "transcript": full_text,
                "segments": segments,
            }

    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="Timeout fetching subtitles")
    except FileNotFoundError:
        raise HTTPException(status_code=503, detail="yt-dlp not installed on server")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch transcript: {str(e)}")


# ============ Run ============

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
