# backend/connections.py
from fastapi import WebSocket

dashboard_clients: list[WebSocket] = []

esp8266_connected: bool = False

gesture_clients: list[WebSocket] = []
gesture_connected: bool = False