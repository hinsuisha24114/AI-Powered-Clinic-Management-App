from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
    Float,
    JSON
)
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


# =========================
# USERS
# =========================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, default="doctor")
    hashed_password = Column(String, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)


# =========================
# PATIENTS
# =========================
class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    age = Column(Integer)
    gender = Column(String)
    phone = Column(String, index=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    prescriptions = relationship(
        "Prescription",
        back_populates="patient",
        cascade="all, delete"
    )

    appointments = relationship(
        "Appointment",
        back_populates="patient",
        cascade="all, delete"
    )

    bills = relationship(
        "Bill",
        back_populates="patient",
        cascade="all, delete"
    )


# =========================
# APPOINTMENTS
# =========================
class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    appointment_time = Column(DateTime, nullable=False)
    status = Column(String, default="scheduled")

    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="appointments")
    queue_token = relationship("QueueToken", back_populates="appointment", uselist=False)


# =========================
# PRESCRIPTIONS
# =========================
class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    diagnosis = Column(String, nullable=False)
    medicines = Column(JSON, nullable=False)   # ✅ FIXED
    notes = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="prescriptions")


# =========================
# BILLING
# =========================
class Bill(Base):
    __tablename__ = "billing"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String, default="unpaid")

    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="bills")


# =========================
# QUEUE MANAGEMENT
# =========================
class QueueToken(Base):
    __tablename__ = "queue_tokens"

    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=False)
    token_number = Column(Integer, nullable=False)
    status = Column(String, default="waiting")

    created_at = Column(DateTime, default=datetime.utcnow)

    appointment = relationship("Appointment", back_populates="queue_token")


# =========================
# AI NOTES (VOICE → SOAP)
# =========================
class AINote(Base):
    __tablename__ = "ai_notes"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    transcript = Column(Text, nullable=False)
    structured_summary = Column(JSON)  # SOAP / EMR structured output

    created_at = Column(DateTime, default=datetime.utcnow)










