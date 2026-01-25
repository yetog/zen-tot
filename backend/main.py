"""
Zen TOT Backend API
FastAPI server for IONOS DCD deployment
"""

import os
import uuid
import httpx
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
import boto3
from botocore.config import Config

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Configuration
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
IONOS_API_KEY = os.getenv("IONOS_API_KEY", "")
IONOS_S3_ENDPOINT = os.getenv("IONOS_S3_ENDPOINT", "")
IONOS_S3_ACCESS_KEY = os.getenv("IONOS_S3_ACCESS_KEY", "")
IONOS_S3_SECRET_KEY = os.getenv("IONOS_S3_SECRET_KEY", "")
IONOS_S3_BUCKET = os.getenv("IONOS_S3_BUCKET", "zen-tot-uploads")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

# Initialize FastAPI
app = FastAPI(
    title="Zen TOT API",
    description="Backend API for Zen TOT note-taking application",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize S3 client for IONOS Object Storage
s3_client = None
if IONOS_S3_ENDPOINT and IONOS_S3_ACCESS_KEY and IONOS_S3_SECRET_KEY:
    s3_client = boto3.client(
        's3',
        endpoint_url=IONOS_S3_ENDPOINT,
        aws_access_key_id=IONOS_S3_ACCESS_KEY,
        aws_secret_access_key=IONOS_S3_SECRET_KEY,
        config=Config(signature_version='s3v4')
    )
    print(f"✅ S3 client initialized for {IONOS_S3_ENDPOINT}")
else:
    print("⚠️ S3 not configured - file uploads will be disabled")


# ============ Models ============

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


class UploadUrlRequest(BaseModel):
    filename: str
    contentType: str


# ============ Health Check ============

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "elevenlabs": bool(ELEVENLABS_API_KEY),
            "ionos_ai": bool(IONOS_API_KEY),
            "s3": s3_client is not None,
        }
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
        
        return Response(
            content=response.content,
            media_type="audio/mpeg"
        )


# ============ Audio Transcription ============

@app.post("/api/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    """Transcribe audio file using ElevenLabs STT"""
    if not ELEVENLABS_API_KEY:
        raise HTTPException(status_code=503, detail="ElevenLabs API key not configured")
    
    audio_content = await audio.read()
    
    async with httpx.AsyncClient() as client:
        # Use ElevenLabs Speech-to-Text (scribe_v1)
        response = await client.post(
            "https://api.elevenlabs.io/v1/speech-to-text",
            headers={
                "xi-api-key": ELEVENLABS_API_KEY,
            },
            files={
                "audio": (audio.filename or "audio.webm", audio_content, audio.content_type)
            },
            data={
                "model_id": "scribe_v1"
            },
            timeout=60.0
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Transcription error: {response.text}"
            )
        
        result = response.json()
        return {
            "text": result.get("text", ""),
            "language": result.get("language_code"),
            "duration": result.get("duration_seconds"),
            "confidence": result.get("confidence"),
        }


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


# ============ File Storage ============

@app.post("/api/storage/upload-url")
async def get_upload_url(request: UploadUrlRequest):
    """Generate pre-signed URL for S3 upload"""
    if not s3_client:
        raise HTTPException(status_code=503, detail="Object storage not configured")
    
    # Generate unique file key
    file_ext = os.path.splitext(request.filename)[1]
    file_key = f"uploads/{datetime.utcnow().strftime('%Y/%m/%d')}/{uuid.uuid4()}{file_ext}"
    
    try:
        # Generate pre-signed upload URL
        upload_url = s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': IONOS_S3_BUCKET,
                'Key': file_key,
                'ContentType': request.contentType,
            },
            ExpiresIn=3600  # 1 hour
        )
        
        # Generate public URL for accessing the file
        file_url = f"{IONOS_S3_ENDPOINT}/{IONOS_S3_BUCKET}/{file_key}"
        
        return {
            "uploadUrl": upload_url,
            "fileUrl": file_url,
            "fileKey": file_key,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate upload URL: {str(e)}")


# ============ Run ============

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
