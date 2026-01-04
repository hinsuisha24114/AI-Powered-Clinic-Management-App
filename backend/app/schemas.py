from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

# -----------------------------
# Patients
# -----------------------------
class PatientCreate(BaseModel):
    name: str
    age: int
    gender: str
    phone: str


class PatientOut(PatientCreate):
    id: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# -----------------------------
# Appointments
# -----------------------------
class AppointmentCreate(BaseModel):
    patient_id: int
    appointment_time: datetime


class AppointmentResponse(AppointmentCreate):
    id: int
    status: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# -----------------------------
# Prescriptions
# -----------------------------
class PrescriptionCreate(BaseModel):
    patient_id: int
    diagnosis: str
    medicines: List[dict] = []
    notes: Optional[str] = None


class PrescriptionResponse(PrescriptionCreate):
    id: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# -----------------------------
# Billing
# -----------------------------
class BillCreate(BaseModel):
    patient_id: int
    amount: float
    description: Optional[str] = None
    status: Optional[str] = "unpaid"


class BillUpdate(BaseModel):
    status: Optional[str] = None
    amount: Optional[float] = None


class BillResponse(BaseModel):
    id: int
    patient_id: int
    amount: float
    description: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# -----------------------------
# AI Assistant Schemas
# -----------------------------
class DiagnosisRequest(BaseModel):
    diagnosis: str


class PrescriptionSuggestionResponse(BaseModel):
    diagnosis: str
    medicines: list
    notes: str
