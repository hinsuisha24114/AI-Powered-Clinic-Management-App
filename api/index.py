from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Clinic Backend Running Successfully"}