from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Bill
from app.schemas import BillCreate, BillResponse

router = APIRouter()

@router.post("/", response_model=BillResponse)
def create_bill(data: BillCreate, db: Session = Depends(get_db)):
    bill = Bill(**data.dict())
    db.add(bill)
    db.commit()
    db.refresh(bill)
    return bill


@router.get("/patient/{patient_id}", response_model=list[BillResponse])
def bills_by_patient(patient_id: int, db: Session = Depends(get_db)):
    return db.query(Bill).filter(Bill.patient_id == patient_id).order_by(Bill.created_at.desc()).all()


@router.delete("/{bill_id}", status_code=204)
def delete_bill(bill_id: int, db: Session = Depends(get_db)):
    bill = db.query(Bill).filter(Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    db.delete(bill)
    db.commit()
    return
