# OpenAI Integration Setup Guide

## Step 1: Get Your OpenAI API Key

### How to Get Your API Key:

1. **Go to OpenAI Platform**
   - Visit: https://platform.openai.com/account/api-keys
   - Sign in with your OpenAI account (create one if needed)

2. **Create New Secret Key**
   - Click "+ Create new secret key"
   - Copy the key (you won't see it again, so save it!)
   - Key format: `sk-...` (very long string)

3. **Billing Setup**
   - Add payment method in billing section
   - Set usage limits to avoid unexpected charges
   - Free trial credits usually provided ($5-$18)

---

## Step 2: Add Key to Your Backend

### Option A: Using .env file (Recommended for Development)

1. Open `/backend/.env`
2. Update this line:
   ```
   OPENAI_API_KEY=sk-your-actual-key-here
   ```
   Replace `sk-your-actual-key-here` with your actual API key from OpenAI

3. Save the file

4. Restart the backend server:
   ```bash
   cd backend
   python run.py
   ```

### Option B: Using Environment Variables (Production)

Set in your system environment:
```bash
set OPENAI_API_KEY=sk-your-actual-key-here
```

---

## Step 3: Verify Integration

1. **Refresh the browser** (Ctrl+F5)
2. **Go to Prescription page**
3. **Select a patient**
4. **Record voice** or **type diagnosis**
5. **System will now use OpenAI GPT** to generate medicines!

---

## Configuration Options

In `.env` file, you can customize:

```env
# Your API Key (Required)
OPENAI_API_KEY=sk-...

# Model to use (default: gpt-3.5-turbo)
OPENAI_MODEL=gpt-3.5-turbo
# Options: gpt-4, gpt-4-turbo-preview, gpt-3.5-turbo

# Creativity level (0-2, default: 0.7)
OPENAI_TEMPERATURE=0.7
# Lower = more deterministic, Higher = more creative
```

---

## Fallback System

**Don't have an API key?** No problem!
- If `OPENAI_API_KEY` is missing or invalid
- System automatically falls back to **rule-based** medicine generation
- Works perfectly for common conditions (fever, pain, cold, etc.)

---

## API Key Safety

⚠️ **IMPORTANT**:
- ✅ Keep your key SECRET
- ✅ Never commit `.env` to Git
- ✅ Rotate keys regularly
- ✅ Monitor usage in OpenAI dashboard
- ❌ Don't share your key with anyone

---

## Cost Estimation

**GPT-3.5-turbo pricing** (as of 2024):
- Input: $0.0005 per 1K tokens
- Output: $0.0015 per 1K tokens

**Typical prescription generation**: ~100 tokens = ~$0.0002
- Generate 1000 prescriptions = ~$0.20

Set billing limits in OpenAI account to be safe!

---

## Troubleshooting

### Error: "Numpy is not available"
```bash
pip install --upgrade numpy
```

### Error: "No API key found"
Check if `OPENAI_API_KEY` is set in `.env` with correct format (starts with `sk-`)

### Error: "Invalid API key"
- Copy the key again from OpenAI dashboard
- Make sure there are no extra spaces
- Ensure key hasn't been revoked

### Medicine suggestions seem generic
- Increase `OPENAI_TEMPERATURE` to 0.9 for more varied responses
- Try providing more detailed diagnosis information

---

## Next Steps

After OpenAI is configured:

1. Test with various diagnoses
2. Monitor API usage in OpenAI dashboard
3. Set budget limits to avoid surprises
4. Consider upgrading to GPT-4 for better results
5. Adjust temperature/model based on needs

---

## Need Help?

- **OpenAI Docs**: https://platform.openai.com/docs
- **API Reference**: https://platform.openai.com/docs/api-reference
- **Status Page**: https://status.openai.com

---

## System Architecture

```
Voice Recording
       ↓
Whisper API (Transcription)
       ↓
Diagnosis Text
       ↓
OpenAI GPT (Medicine Generation)
       ↓
Medicine List
       ↓
Save to Patient Record
```

The system now has intelligent AI-powered prescription generation! 🎉
