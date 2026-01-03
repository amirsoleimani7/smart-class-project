# backend/routes/dashboard.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from connections import dashboard_clients
import connections

router = APIRouter()

@router.websocket("/ws/dashboard")
async def dashboard_ws(ws: WebSocket):
    await ws.accept()
    dashboard_clients.append(ws)

    # 🔴 SEND CURRENT ESP8266 STATUS ON CONNECT
    await ws.send_json({
        "type": "status",
        "device": "esp8266",
        "connected": connections.esp8266_connected
    })

    # also send gesture status on connect
    await ws.send_json({
        "type": "status",
        "device": "gesture",
        "connected": connections.gesture_connected
    })


    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        dashboard_clients.remove(ws)

