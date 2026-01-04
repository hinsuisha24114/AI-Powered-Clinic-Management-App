# Whisper Transcription Fix Guide

## Issue
Error: "Numpy is not available" when trying to transcribe audio

## Root Cause
NumPy 2.x has compatibility issues with Whisper and Torch on Windows. The requirements specify NumPy 1.26.4 which is compatible, but it may not be properly installed.

## Solutions

### Solution 1: Reinstall NumPy (Recommended)
Run this command in your backend directory:

```bash
cd backend
pip install --force-reinstall numpy==1.26.4
```

### Solution 2: Complete Dependency Reinstall
If Solution 1 doesn't work:

```bash
cd backend
pip uninstall -y numpy torch torchaudio openai-whisper
pip install -r requirements.txt
```

### Solution 3: Check FFmpeg Installation
Whisper requires FFmpeg. Install it:

**Windows (using Chocolatey):**
```bash
choco install ffmpeg
```

**Windows (Manual):**
1. Download from: https://ffmpeg.org/download.html
2. Add to PATH environment variable

**Verify installation:**
```bash
ffmpeg -version
```

### Solution 4: Verify Installation
After installing, test Whisper:

```bash
python -c "import numpy; import torch; import whisper; print('✓ All dependencies OK')"
```

## What Changed in the Code

### Frontend (VoiceRecorder.jsx)
- Better error message handling
- Automatically clears recording after successful transcription
- More detailed error feedback

### Frontend (api.js)
- Removed explicit Content-Type header (axios auto-detects FormData)
- Cleaner API call for transcription

### Backend (ai_service.py)
- Better error handling for NumPy import errors
- More descriptive error messages
- Suggests solution when NumPy is missing

## Testing the Fix

1. **Backend Terminal**: Should see no errors starting uvicorn
2. **Prescription Page**: Select a patient
3. **Click 🎤 button**: Record audio ("Patient has fever")
4. **Click 📝 Transcribe**: Should transcribe successfully
5. **Medicines should auto-generate**: Based on diagnosis

## If Still Getting Errors

1. **Clear cache**: `pip cache purge`
2. **Try smaller model**: Edit backend .env: `WHISPER_MODEL_SIZE=tiny`
3. **Check Python version**: Need Python 3.8+
4. **Restart uvicorn**: `python run.py` or `uvicorn app.main:app --reload`

## Common Errors & Fixes

| Error | Solution |
|-------|----------|
| "Numpy is not available" | `pip install --force-reinstall numpy==1.26.4` |
| "ffmpeg is not found" | Install FFmpeg, add to PATH |
| "CUDA out of memory" | Use smaller model: `WHISPER_MODEL_SIZE=tiny` |
| "Module not found: whisper" | `pip install openai-whisper==20231117` |

## Notes

- NumPy 1.26.4 is pinned for Windows compatibility
- Whisper model sizes: tiny, base, small, medium, large (larger = more accurate but slower)
- First transcription takes longer (model loading)
- Ensure microphone permissions are granted in browser
