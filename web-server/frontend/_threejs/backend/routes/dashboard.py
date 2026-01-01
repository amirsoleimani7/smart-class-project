# backend/routes/dashboard.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from connections import dashboard_clients

router = APIRouter()   # 🔴 REQUIRED

@router.websocket("/ws/dashboard")
async def dashboard_ws(ws: WebSocket):
    await ws.accept()
    dashboard_clients.append(ws)

    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        dashboard_clients.remove(ws)
