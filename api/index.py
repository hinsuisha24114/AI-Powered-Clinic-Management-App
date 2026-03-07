from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Clinic Backend Running"}

from backend.main import app