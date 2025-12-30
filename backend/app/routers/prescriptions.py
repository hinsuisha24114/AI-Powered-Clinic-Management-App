from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Prescription
from app.schemas import PrescriptionCreate, PrescriptionResponse

router = APIRouter()

@router.post("/")
def save_prescription(data: PrescriptionCreate, db: Session = Depends(get_db)):
    p = Prescription(**data.dict())
    db.add(p)
    db.commit()
    return {"message": "Prescription saved"}


@router.get("/patient/{patient_id}", response_model=list[PrescriptionResponse])
def prescriptions_by_patient(patient_id: int, db: Session = Depends(get_db)):
    return db.query(Prescription).filter(Prescription.patient_id == patient_id).order_by(Prescription.created_at.desc()).all()


@router.delete("/{prescription_id}", status_code=204)
def delete_prescription(prescription_id: int, db: Session = Depends(get_db)):
    p = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Prescription not found")
    db.delete(p)
    db.commit()
    return
