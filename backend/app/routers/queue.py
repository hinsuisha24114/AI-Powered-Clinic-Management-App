from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import Appointment, QueueToken

router = APIRouter()

@router.get("/")
def get_queue(db: Session = Depends(get_db)):
    tokens = db.query(QueueToken).order_by(QueueToken.token_number).all()
    return [
        {
            "token_id": t.id,
            "token_number": t.token_number,
            "appointment_id": t.appointment_id,
            "status": t.status
        }
        for t in tokens
    ]


@router.post("/")
def create_queue_token(appointment_id: int, db: Session = Depends(get_db)):
    # ensure appointment exists
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    current_max = db.query(func.max(QueueToken.token_number)).scalar() or 0
    token = QueueToken(
        appointment_id=appointment_id,
        token_number=current_max + 1,
        status="waiting"
    )
    db.add(token)
    db.commit()
    db.refresh(token)
    return {
        "token_id": token.id,
        "token_number": token.token_number,
        "appointment_id": token.appointment_id,
        "status": token.status
    }


@router.patch("/{token_id}")
def update_queue_token(token_id: int, status: str, db: Session = Depends(get_db)):
    token = db.query(QueueToken).filter(QueueToken.id == token_id).first()
    if not token:
        raise HTTPException(status_code=404, detail="Token not found")
    token.status = status
    db.commit()
    db.refresh(token)
    return {
        "token_id": token.id,
        "token_number": token.token_number,
        "appointment_id": token.appointment_id,
        "status": token.status
    }


@router.delete("/{token_id}", status_code=204)
def delete_queue_token(token_id: int, db: Session = Depends(get_db)):
    token = db.query(QueueToken).filter(QueueToken.id == token_id).first()
    if not token:
        raise HTTPException(status_code=404, detail="Token not found")
    db.delete(token)
    db.commit()
    return
