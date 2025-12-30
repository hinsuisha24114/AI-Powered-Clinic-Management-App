from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Patient, Appointment, Prescription, Bill
from app.schemas import PatientCreate, PatientOut, PatientSummary, AppointmentResponse, PrescriptionResponse, BillResponse

router = APIRouter()

@router.post("/", response_model=PatientOut)
def create_patient(data: PatientCreate, db: Session = Depends(get_db)):
    patient = Patient(**data.dict(exclude_none=True))
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient

@router.get("/", response_model=list[PatientOut])
def get_patients(db: Session = Depends(get_db)):
    return db.query(Patient).all()

@router.get("/{patient_id}", response_model=PatientOut)
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    return db.query(Patient).filter(Patient.id == patient_id).first()


@router.delete("/{patient_id}", status_code=204)
def delete_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    db.delete(patient)
    db.commit()
    return


@router.get("/{patient_id}/summary", response_model=PatientSummary)
def patient_summary(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    appointments = db.query(Appointment).filter(Appointment.patient_id == patient_id).order_by(Appointment.appointment_time.desc()).all()
    prescriptions = db.query(Prescription).filter(Prescription.patient_id == patient_id).order_by(Prescription.created_at.desc()).all()
    bills = db.query(Bill).filter(Bill.patient_id == patient_id).order_by(Bill.created_at.desc()).all()
    return {
        "patient": patient,
        "appointments": appointments,
        "prescriptions": prescriptions,
        "bills": bills
    }
