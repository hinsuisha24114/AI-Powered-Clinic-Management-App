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



from fastapi import APIRouter
from app.schemas import (
    DiagnosisRequest,
    PrescriptionSuggestionResponse
)
import os
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

router = APIRouter()

# Initialize OpenAI client
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
OPENAI_TEMPERATURE = float(os.getenv("OPENAI_TEMPERATURE", "0.7"))

client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

def generate_prescription_with_openai(diagnosis: str):
    """Generate prescription using OpenAI GPT"""
    if not client or not OPENAI_API_KEY:
        return generate_prescription_fallback(diagnosis)
    
    try:
        prompt = f"""Based on the following medical diagnosis, suggest appropriate medicines with dosage and duration.
        
Diagnosis: {diagnosis}

Respond in JSON format with a list of medicines. Each medicine should have:
- name: medicine name
- dosage: dosage amount (e.g., "500 mg")
- duration: duration of treatment (e.g., "5 days")

Example format:
[
  {{"name": "Medicine Name", "dosage": "500 mg", "duration": "5 days"}},
  {{"name": "Another Medicine", "dosage": "1 tablet", "duration": "10 days"}}
]

Important: Return ONLY valid JSON array, no additional text."""

        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are a medical assistant that suggests medicines based on diagnoses. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=OPENAI_TEMPERATURE,
            max_tokens=500
        )
        
        import json
        response_text = response.choices[0].message.content.strip()
        medicines = json.loads(response_text)
        return medicines if isinstance(medicines, list) else [medicines]
        
    except Exception as e:
        print(f"OpenAI error: {str(e)}")
        return generate_prescription_fallback(diagnosis)

def generate_prescription_fallback(diagnosis: str):
    """Fallback rule-based prescription generation"""
    d = diagnosis.lower()

    if "fever" in d:
        return [
            {"name": "Paracetamol", "dosage": "650 mg", "duration": "3 days"},
            {"name": "ORS", "dosage": "After meals", "duration": "3 days"}
        ]

    if "back pain" in d or "pain" in d:
        return [
            {"name": "Ibuprofen", "dosage": "400 mg", "duration": "5 days"}
        ]

    if "cough" in d or "cold" in d:
        return [
            {"name": "Cetirizine", "dosage": "10 mg", "duration": "5 days"},
            {"name": "Cough Syrup", "dosage": "10 ml", "duration": "5 days"}
        ]

    if "diabetes" in d:
        return [
            {"name": "Metformin", "dosage": "500 mg", "duration": "30 days"}
        ]

    return [
        {"name": "Multivitamin", "dosage": "Once daily", "duration": "7 days"}
    ]

# Use OpenAI if key available, otherwise fallback
def generate_prescription(diagnosis: str):
    """Main function to generate prescription"""
    if client and OPENAI_API_KEY:
        return generate_prescription_with_openai(diagnosis)
    else:
        return generate_prescription_fallback(diagnosis)

@router.post(
    "/prescription-suggest",
    response_model=PrescriptionSuggestionResponse
)
def suggest_prescription(data: DiagnosisRequest):
    return {
        "diagnosis": data.diagnosis,
        "medicines": generate_prescription(data.diagnosis),
        "notes": "AI-generated. Doctor approval required."
    }
