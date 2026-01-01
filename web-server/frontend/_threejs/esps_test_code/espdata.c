#include <ESP8266WiFi.h>
#include <WebSocketsClient.h>

const char* ssid = "YOUR_WIFI";
const char* password = "YOUR_PASS";

WebSocketsClient webSocket;

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  webSocket.begin("192.168.1.100", 8000, "/ws/sensors");
  webSocket.onEvent(webSocketEvent);
}

void loop() {
  webSocket.loop();

  static unsigned long last = 0;
  if (millis() - last > 1000) {
    last = millis();

    String payload = "{\"temperature\":25.4,\"humidity\":52}";
    webSocket.sendTXT(payload);
  }
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  if (type == WStype_CONNECTED) {
    Serial.println("Connected to backend");
  }
}
