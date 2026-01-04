# Whisper Voice-to-Text Setup Guide

This guide will help you set up and configure OpenAI Whisper for voice transcription in your AI-Powered Clinic Management App.

## Overview

The Voice-to-Text feature uses OpenAI Whisper, an open-source speech recognition model that runs locally on your machine. The workflow is:

1. **Doctor speaks** → Browser records audio using MediaRecorder API
2. **React uploads** → Audio file sent to FastAPI backend
3. **Whisper transcribes** → Audio converted to text using Whisper model
4. **Text returned** → Transcribed text displayed in UI and can be saved to database

## Prerequisites

- Python 3.8+ (Python 3.11 recommended)
- pip package manager
- At least 2GB RAM (4GB+ recommended)
- GPU optional but recommended for faster processing (CUDA-compatible GPU)

## Installation Steps

### Step 1: Install System Dependencies

#### Windows
```powershell
# Install FFmpeg (required for audio processing)
# Download from: https://ffmpeg.org/download.html
# Or use chocolatey:
choco install ffmpeg

# Verify installation
ffmpeg -version
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install ffmpeg
```

#### macOS
```bash
brew install ffmpeg
```

### Step 2: Install Python Dependencies

Navigate to your backend directory:

```bash
cd backend
```

The required packages are already in `requirements.txt`:
- `whisper==1.1.10` - OpenAI Whisper library
- `torch==2.1.0` - PyTorch for model inference
- `torchaudio==2.1.0` - Audio processing utilities

Install dependencies:

```bash
# Activate virtual environment (if using one)
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install all dependencies
pip install -r requirements.txt
```

### Step 3: Verify Whisper Installation

Test that Whisper is installed correctly:

```bash
python -c "import whisper; print('Whisper installed successfully')"
```

### Step 4: Configure Model Size (Optional)

The default model size is `base` (good balance of speed and accuracy). You can change this in your `.env` file:

```env
# Whisper Model Sizes (choose one):
# tiny   - Fastest, least accurate (~39M parameters)
# base   - Balanced (default) (~74M parameters)
# small  - Better accuracy (~244M parameters)
# medium - High accuracy (~769M parameters)
# large  - Best accuracy, slowest (~1550M parameters)

WHISPER_MODEL_SIZE=base
```

**Model Size Recommendations:**
- **CPU-only systems**: Use `tiny` or `base`
- **GPU systems**: Use `small` or `medium`
- **Production/High accuracy**: Use `large`

### Step 5: First-Time Model Download

When you first use the transcription feature, Whisper will automatically download the model. This happens automatically on the first API call.

**Manual download (optional):**
```python
import whisper
model = whisper.load_model("base")  # Replace with your chosen size
```

**Model Download Locations:**
- Windows: `C:\Users\<username>\.cache\whisper\`
- Linux/Mac: `~/.cache/whisper/`

**Model Sizes (download sizes):**
- tiny: ~75 MB
- base: ~150 MB
- small: ~500 MB
- medium: ~1.5 GB
- large: ~3 GB

## GPU Setup (Optional but Recommended)

For faster transcription, use GPU acceleration:

### CUDA Setup (NVIDIA GPU)

1. **Install CUDA Toolkit:**
   - Download from: https://developer.nvidia.com/cuda-downloads
   - Install CUDA 11.8 or 12.1

2. **Install PyTorch with CUDA:**
   ```bash
   # Uninstall CPU-only PyTorch
   pip uninstall torch torchaudio

   # Install CUDA-enabled PyTorch (CUDA 11.8)
   pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu118

   # Or for CUDA 12.1
   pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu121
   ```

3. **Verify GPU:**
   ```python
   import torch
   print(torch.cuda.is_available())  # Should return True
   print(torch.cuda.get_device_name(0))  # Should show your GPU name
   ```

### Apple Silicon (M1/M2/M3 Mac)

PyTorch automatically uses Metal Performance Shaders (MPS) on Apple Silicon:

```python
import torch
print(torch.backends.mps.is_available())  # Should return True
```

## Testing the Setup

### Test Backend Endpoint

1. **Start the backend server:**
   ```bash
   cd backend
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Test with curl (or Postman):**
   ```bash
   # Create a test audio file first, then:
   curl -X POST "http://localhost:8000/api/ai/transcribe" \
     -H "accept: application/json" \
     -H "Content-Type: multipart/form-data" \
     -F "file=@test_audio.wav"
   ```

### Test Frontend Integration

1. **Start the frontend:**
   ```bash
   cd frontend
   npm install  # If not already done
   npm run dev
   ```

2. **Navigate to Prescription page:**
   - Open http://localhost:5173
   - Go to Prescription page
   - Click "Start Recording" button
   - Grant microphone permissions when prompted
   - Speak into microphone
   - Click "Stop Recording"
   - Click "Transcribe"
   - Check that transcribed text appears in Diagnosis field

## Troubleshooting

### Issue: "No module named 'whisper'"

**Solution:**
```bash
pip install openai-whisper
# Or
pip install --upgrade -r requirements.txt
```

### Issue: "FFmpeg not found"

**Solution:**
- Ensure FFmpeg is installed and in your PATH
- Windows: Add FFmpeg to system PATH or use full path
- Verify: `ffmpeg -version` should work in terminal

### Issue: "Out of memory" or slow transcription

**Solutions:**
1. Use a smaller model size (`tiny` or `base`)
2. Reduce audio file length (split long recordings)
3. Use GPU acceleration if available
4. Increase system RAM

### Issue: "Microphone permission denied"

**Solution:**
- Browser settings → Privacy → Microphone → Allow for localhost
- Use HTTPS in production (required for microphone access)

### Issue: Model download fails

**Solution:**
- Check internet connection
- Manually download model files to `~/.cache/whisper/`
- Use a VPN if in restricted network

### Issue: Transcription accuracy is poor

**Solutions:**
1. Use a larger model (`medium` or `large`)
2. Ensure good audio quality (quiet environment, clear speech)
3. Specify language in API call if known
4. Use external microphone instead of built-in

## Performance Optimization

### For Production:

1. **Use GPU:** Significantly faster (10-50x speedup)
2. **Model caching:** Models are cached after first load
3. **Batch processing:** Process multiple files in queue
4. **Async processing:** Use background tasks for long audio files
5. **CDN/Cloud:** Consider cloud Whisper API for scalability

### Expected Performance:

**CPU (base model):**
- ~1-2 seconds per second of audio
- Example: 10-second audio = 10-20 seconds processing

**GPU (base model):**
- ~0.1-0.2 seconds per second of audio
- Example: 10-second audio = 1-2 seconds processing

## API Endpoint Details

### Endpoint: `POST /api/ai/transcribe`

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: `file` (audio file)

**Supported Formats:**
- WAV, MP3, M4A, WebM, OGG, FLAC, MP4

**Response:**
```json
{
  "text": "Transcribed text here",
  "language": "en",
  "success": true
}
```

**Error Response:**
```json
{
  "detail": "Error message"
}
```

## Environment Variables

Add to your `.env` file:

```env
# Whisper Configuration
WHISPER_MODEL_SIZE=base  # tiny, base, small, medium, large

# Optional: Specify default language (auto-detect if not set)
# WHISPER_DEFAULT_LANGUAGE=en
```

## Next Steps

1. ✅ Test the basic setup
2. ✅ Configure model size for your hardware
3. ✅ Set up GPU acceleration (if available)
4. ✅ Test with real audio recordings
5. ✅ Integrate with database to save transcriptions
6. ✅ Add language selection in UI
7. ✅ Implement batch processing for multiple files

## Additional Resources

- [OpenAI Whisper GitHub](https://github.com/openai/whisper)
- [Whisper Paper](https://arxiv.org/abs/2212.04356)
- [PyTorch Installation Guide](https://pytorch.org/get-started/locally/)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review backend logs for error messages
3. Verify all dependencies are installed correctly
4. Test with a simple audio file first

---

**Note:** The first transcription will be slower as Whisper downloads and loads the model. Subsequent transcriptions will be faster as the model is cached in memory.

