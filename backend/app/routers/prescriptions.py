from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Prescription, Patient
from app.schemas import PrescriptionCreate, PrescriptionResponse
from typing import List

router = APIRouter()

@router.post("/", response_model=PrescriptionResponse)
def save_prescription(data: PrescriptionCreate, db: Session = Depends(get_db)):
    """Create and save a new prescription"""
    try:
        # Verify patient exists
        patient = db.query(Patient).filter(Patient.id == data.patient_id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        p = Prescription(**data.model_dump())
        db.add(p)
        db.commit()
        db.refresh(p)
        return p
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/patient/{patient_id}", response_model=List[PrescriptionResponse])
def get_patient_prescriptions(patient_id: int, db: Session = Depends(get_db)):
    """Get all prescriptions for a specific patient"""
    try:
        patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        prescriptions = db.query(Prescription).filter(
            Prescription.patient_id == patient_id
        ).order_by(Prescription.created_at.desc()).all()
        
        return prescriptions
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{prescription_id}", response_model=PrescriptionResponse)
def get_prescription(prescription_id: int, db: Session = Depends(get_db)):
    """Get a specific prescription by ID"""
    try:
        prescription = db.query(Prescription).filter(
            Prescription.id == prescription_id
        ).first()
        
        if not prescription:
            raise HTTPException(status_code=404, detail="Prescription not found")
        
        return prescription
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{prescription_id}")
def delete_prescription(prescription_id: int, db: Session = Depends(get_db)):
    """Delete a prescription"""
    try:
        prescription = db.query(Prescription).filter(
            Prescription.id == prescription_id
        ).first()
        
        if not prescription:
            raise HTTPException(status_code=404, detail="Prescription not found")
        
        db.delete(prescription)
        db.commit()
        return {"message": "Prescription deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
