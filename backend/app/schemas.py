from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class PatientCreate(BaseModel):
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None


class PatientOut(PatientCreate):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AppointmentCreate(BaseModel):
    patient_id: int
    appointment_time: datetime


class AppointmentResponse(AppointmentCreate):
    id: int
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PrescriptionCreate(BaseModel):
    patient_id: int
    diagnosis: str
    medicines: List[Dict[str, Any]] | List[str]
    notes: Optional[str] = None


class PrescriptionResponse(PrescriptionCreate):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BillCreate(BaseModel):
    patient_id: int
    amount: float
    status: Optional[str] = "unpaid"


class BillResponse(BillCreate):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# =========================
# AI Assistant
# =========================
class DiagnosisRequest(BaseModel):
    diagnosis: str


class PrescriptionSuggestionResponse(BaseModel):
    diagnosis: str
    medicines: List[Dict[str, Any]] | List[str]
    notes: Optional[str] = None


class AIPrescriptionRequest(BaseModel):
    diagnosis: str
    symptoms: Optional[str] = None


class AIPrescriptionResponse(BaseModel):
    diagnosis: str
    medicines: List[Dict[str, Any]]
    notes: Optional[str] = None


class TranscriptionResponse(BaseModel):
    text: str


class PatientSummary(BaseModel):
    patient: Optional[PatientOut]
    appointments: List[AppointmentResponse]
    prescriptions: List[PrescriptionResponse]
    bills: List[BillResponse]
