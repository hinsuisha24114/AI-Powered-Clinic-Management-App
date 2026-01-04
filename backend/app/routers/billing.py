from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Bill, Patient
from app.schemas import BillCreate, BillResponse, BillUpdate
from typing import List

router = APIRouter()


@router.get("/", response_model=List[BillResponse])
def get_all_bills(db: Session = Depends(get_db)):
    """Get all bills"""
    try:
        bills = db.query(Bill).all()
        return bills
    except Exception as e:
        print(f"ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=BillResponse)
def create_bill(data: BillCreate, db: Session = Depends(get_db)):
    """Create a new bill for a patient"""
    try:
        patient = db.query(Patient).filter(Patient.id == data.patient_id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        bill = Bill(
            patient_id=data.patient_id,
            amount=data.amount,
            description=data.description or "",
            status=data.status or "unpaid"
        )
        db.add(bill)
        db.commit()
        db.refresh(bill)
        return bill
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/patient/{patient_id}", response_model=List[BillResponse])
def get_bills_by_patient(patient_id: int, db: Session = Depends(get_db)):
    """Get all bills for a specific patient"""
    try:
        bills = db.query(Bill).filter(Bill.patient_id == patient_id).all()
        return bills
    except Exception as e:
        print(f"ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{bill_id}", response_model=BillResponse)
def get_bill(bill_id: int, db: Session = Depends(get_db)):
    """Get a specific bill by ID"""
    try:
        bill = db.query(Bill).filter(Bill.id == bill_id).first()
        if not bill:
            raise HTTPException(status_code=404, detail="Bill not found")
        return bill
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{bill_id}", response_model=BillResponse)
def update_bill(bill_id: int, data: BillUpdate, db: Session = Depends(get_db)):
    """Update bill status or amount"""
    try:
        bill = db.query(Bill).filter(Bill.id == bill_id).first()
        if not bill:
            raise HTTPException(status_code=404, detail="Bill not found")
        
        if data.status is not None:
            bill.status = data.status
        if data.amount is not None:
            bill.amount = data.amount
        
        db.commit()
        db.refresh(bill)
        return bill
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{bill_id}")
def delete_bill(bill_id: int, db: Session = Depends(get_db)):
    """Delete a bill"""
    try:
        bill = db.query(Bill).filter(Bill.id == bill_id).first()
        if not bill:
            raise HTTPException(status_code=404, detail="Bill not found")
        
        db.delete(bill)
        db.commit()
        return {"message": "Bill deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
