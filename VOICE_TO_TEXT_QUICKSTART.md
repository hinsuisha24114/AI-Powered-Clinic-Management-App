# Voice-to-Text Feature - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Install FFmpeg

**Windows:**
```powershell
# Option 1: Download from https://ffmpeg.org/download.html
# Option 2: Using Chocolatey
choco install ffmpeg
```

**Linux/Mac:**
```bash
# Ubuntu/Debian
sudo apt install ffmpeg

# macOS
brew install ffmpeg
```

### 2. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3. Configure Model Size (Optional)

Create or edit `.env` file in `backend/`:

```env
WHISPER_MODEL_SIZE=base
```

**Model Options:**
- `tiny` - Fastest, less accurate (good for testing)
- `base` - Balanced (recommended default)
- `small` - Better accuracy
- `medium` - High accuracy
- `large` - Best accuracy, slowest

### 4. Start Backend

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Start Frontend

```bash
cd frontend
npm install  # First time only
npm run dev
```

### 6. Test the Feature

1. Open http://localhost:5173
2. Navigate to **Prescription** page
3. Click **"Start Recording"** button
4. Grant microphone permission
5. Speak your diagnosis/notes
6. Click **"Stop Recording"**
7. Click **"Transcribe"**
8. Transcribed text will appear in the Diagnosis field!

## 📋 What's Included

✅ **Backend:**
- Whisper transcription service (`backend/app/services/ai_service.py`)
- API endpoint `/api/ai/transcribe` (`backend/app/routers/ai_assistant.py`)
- Supports multiple audio formats (WAV, MP3, WebM, etc.)

✅ **Frontend:**
- VoiceRecorder component (`frontend/src/components/VoiceRecorder.jsx`)
- Integrated into Prescription page
- Real-time recording with visual feedback
- Audio preview before transcription

## 🎯 Usage Flow

```
Doctor → Click "Start Recording" → Speak → Stop → Transcribe → Text appears in form
```

## ⚙️ Configuration

### Change Model Size

Edit `backend/.env`:
```env
WHISPER_MODEL_SIZE=small  # Change to your preferred size
```

### Enable GPU (Optional)

For NVIDIA GPU:
```bash
pip uninstall torch torchaudio
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu118
```

## 🐛 Troubleshooting

**"FFmpeg not found"**
- Install FFmpeg and add to PATH
- Verify: `ffmpeg -version`

**"Microphone permission denied"**
- Check browser settings
- Allow microphone for localhost

**Slow transcription**
- Use smaller model (`tiny` or `base`)
- Enable GPU acceleration
- Reduce audio length

**Model download fails**
- Check internet connection
- First use will download model (~150MB for base)

## 📚 Full Documentation

See `WHISPER_SETUP.md` for detailed setup instructions, GPU configuration, and advanced options.

## 🎉 You're Ready!

The Voice-to-Text feature is now fully integrated and ready to use!

