# backend/routes/sensors.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from connections import dashboard_clients
import connections

router = APIRouter()

@router.websocket("/ws/sensors")
async def sensors_ws(ws: WebSocket):
    await ws.accept()

    # 🔴 ESP8266 CONNECTED
    connections.esp8266_connected = True
    await broadcast_status(True)

    try:
        while True:
            data = await ws.receive_json()

            for client in dashboard_clients:
                await client.send_json({
                    "type": "sensor",
                    "data": data
                })

    except WebSocketDisconnect:
        # 🔴 ESP8266 DISCONNECTED
        connections.esp8266_connected = False
        await broadcast_status(False)


async def broadcast_status(connected: bool):
    for client in dashboard_clients:
        await client.send_json({
            "type": "status",
            "device": "esp8266",
            "connected": connected
        })
