from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from app.database import engine
from app import models
from app.routers import auth, appointments, patients, prescriptions, billing, queue, ai_assistant

load_dotenv()

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI-Powered Clinic Management API",
    description="Backend API for clinic management system",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    #allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(appointments.router, prefix="/api/appointments", tags=["Appointments"])
app.include_router(patients.router, prefix="/api/patients", tags=["Patients"])
app.include_router(prescriptions.router, prefix="/api/prescriptions", tags=["Prescriptions"])
app.include_router(billing.router, prefix="/api/billing", tags=["Billing"])
app.include_router(queue.router, prefix="/api/queue", tags=["Queue"])
app.include_router(ai_assistant.router, prefix="/api/ai", tags=["AI Assistant"])

@app.get("/")
async def root():
    return {"message": "AI-Powered Clinic Management API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
