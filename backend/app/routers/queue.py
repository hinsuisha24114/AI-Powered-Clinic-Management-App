from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Appointment

router = APIRouter()

@router.get("/")
def get_queue(db: Session = Depends(get_db)):
    queue = db.query(Appointment).filter(
        Appointment.status == "scheduled"
    ).order_by(Appointment.id).all()

    return [
        {
            "appointment_id": a.id,
            "patient_id": a.patient_id,
            "token": index + 1
        }
        for index, a in enumerate(queue)
    ]
