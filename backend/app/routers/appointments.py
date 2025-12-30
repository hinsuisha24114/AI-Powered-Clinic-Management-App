from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Appointment
from app.schemas import AppointmentCreate, AppointmentResponse


router = APIRouter()

@router.post("/", response_model=AppointmentResponse)
def create_appointment(data: AppointmentCreate, db: Session = Depends(get_db)):
    appointment = Appointment(
        patient_id=data.patient_id,
        appointment_time=data.appointment_time,
        status="scheduled"
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment


@router.get("/", response_model=list[AppointmentResponse])
def get_all_appointments(db: Session = Depends(get_db)):
    return db.query(Appointment).order_by(Appointment.appointment_time.desc()).all()


@router.get("/{appointment_id}", response_model=AppointmentResponse)
def get_appointment(appointment_id: int, db: Session = Depends(get_db)):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment


@router.delete("/{appointment_id}", status_code=204)
def delete_appointment(appointment_id: int, db: Session = Depends(get_db)):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    db.delete(appointment)
    db.commit()
    return
