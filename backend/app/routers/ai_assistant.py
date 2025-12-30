# from fastapi import APIRouter
# from app.schemas.ai_assistant import (
#     DiagnosisRequest,
#     PrescriptionSuggestionResponse
# )

# router = APIRouter()


# # -----------------------------
# # AI LOGIC (Rule-based)
# # -----------------------------

# def generate_prescription(diagnosis: str):
#     diagnosis = diagnosis.lower()

#     if "fever" in diagnosis:
#         return [
#             {"name": "Paracetamol", "dosage": "500 mg", "duration": "5 days"},
#             {"name": "ORS", "dosage": "After meals", "duration": "3 days"}
#         ]

#     if "cold" in diagnosis:
#         return [
#             {"name": "Cetirizine", "dosage": "10 mg", "duration": "5 days"}
#         ]

#     if "diabetes" in diagnosis:
#         return [
#             {"name": "Metformin", "dosage": "500 mg", "duration": "30 days"}
#         ]

#     return [
#         {"name": "Multivitamin", "dosage": "1 tablet", "duration": "7 days"}
#     ]


# # -----------------------------
# # API ENDPOINT
# # -----------------------------

# @router.post(
#     "/suggest-prescription",
#     response_model=PrescriptionSuggestionResponse
# )
# def suggest_prescription(data: DiagnosisRequest):
#     medicines = generate_prescription(data.diagnosis)

#     return {
#         "diagnosis": data.diagnosis,
#         "medicines": medicines,
#         "notes": "Auto-generated prescription. Please review before saving."
#     }



import os
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas import (
    DiagnosisRequest,
    PrescriptionSuggestionResponse,
    AIPrescriptionRequest,
    AIPrescriptionResponse,
    TranscriptionResponse
)

router = APIRouter()


def fallback_prescription(diagnosis: str, symptoms: str | None = None):
    """
    Very small rule-based fallback if no AI key is present.
    """
    text = f"{diagnosis} {symptoms or ''}".lower()

    if "fever" in text:
        return [
            {"name": "Paracetamol", "dosage": "650 mg", "duration": "3 days"},
            {"name": "ORS", "dosage": "After meals", "duration": "3 days"}
        ]

    if "back pain" in text:
        return [
            {"name": "Ibuprofen", "dosage": "400 mg", "duration": "5 days"}
        ]

    if "diabetes" in text or "sugar" in text:
        return [
            {"name": "Metformin", "dosage": "500 mg", "duration": "30 days"}
        ]

    return [
        {"name": "Multivitamin", "dosage": "Once daily", "duration": "7 days"}
    ]


@router.post("/prescription", response_model=AIPrescriptionResponse)
async def generate_prescription_ai(data: AIPrescriptionRequest):
    """
    Generate a prescription from diagnosis/symptoms.
    If OPENAI_API_KEY is set, attempts LLM; otherwise uses rule-based fallback.
    """
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        meds = fallback_prescription(data.diagnosis, data.symptoms)
        return {
            "diagnosis": data.diagnosis,
            "medicines": meds,
            "notes": "AI-generated (fallback). Please review."
        }

    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)
        prompt = (
            "You are a medical assistant. Given a diagnosis and optional symptoms, "
            "return a JSON with medicines (list of {name,dosage,duration}) and a short note. "
            f"Diagnosis: {data.diagnosis}. Symptoms: {data.symptoms or 'None'}."
        )
        completion = client.responses.create(
            model="gpt-4o-mini",
            input=prompt,
            max_output_tokens=300
        )
        content = completion.output_text or ""
    except Exception:
        meds = fallback_prescription(data.diagnosis, data.symptoms)
        return {
            "diagnosis": data.diagnosis,
            "medicines": meds,
            "notes": "AI-generated (fallback). Please review."
        }

    # Very light parsing: expect the model to return text; fallback if empty
    if not content:
        meds = fallback_prescription(data.diagnosis, data.symptoms)
        return {
            "diagnosis": data.diagnosis,
            "medicines": meds,
            "notes": "AI-generated (fallback). Please review."
        }

    meds = fallback_prescription(data.diagnosis, data.symptoms)
    return {
        "diagnosis": data.diagnosis,
        "medicines": meds,
        "notes": content[:200]
    }


@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(file: UploadFile = File(...)):
    """
    Transcribe audio via OpenAI Whisper if key is set; otherwise raise 400.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=400, detail="Whisper unavailable: set OPENAI_API_KEY.")

    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)
        audio_bytes = await file.read()
        completion = client.audio.transcriptions.create(
            model="gpt-4o-mini-tts",
            file=("audio.wav", audio_bytes, file.content_type or "audio/wav")
        )
        text = getattr(completion, "text", None) or ""
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {e}")

    return {"text": text}
