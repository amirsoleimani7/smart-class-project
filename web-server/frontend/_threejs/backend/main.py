# backend/main.py
from fastapi import FastAPI
from routes.sensors import router as sensors_router
from routes.dashboard import router as dashboard_router
from routes.gesture import router as gesture_router  # ✅ add

app = FastAPI()

app.include_router(sensors_router)
app.include_router(dashboard_router)
app.include_router(gesture_router)  # ✅ add

@app.get("/")
def root():
    return {"status": "backend running"}