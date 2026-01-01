# backend/main.py
from fastapi import FastAPI
from routes.sensors import router as sensors_router
from routes.dashboard import router as dashboard_router

app = FastAPI()

app.include_router(sensors_router)
app.include_router(dashboard_router)

@app.get("/")
def root():
    return {"status": "backend running"}
