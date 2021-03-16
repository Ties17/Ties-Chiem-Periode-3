#include <Arduino.h>
#include <PubSubClient.h>
#include <ESP8266WiFi.h>
#include <SoftwareSerial.h>
#include <ArduinoJson.h>
#include <SmartmeterConfig.h>
#include <NTPClient.h>
#include <WiFiUdp.h>

WiFiClient wifi;
PubSubClient mqtt;
SoftwareSerial p1;

WiFiUDP udp;
NTPClient ntp(udp, "pool.ntp.org", 3600);

DynamicJsonDocument doc(1024);
char output[1024];

void connectMQTT()
{
  while (!mqtt.connected())
  {
    mqtt.connect("SMARTMETER-TIES");

    if (mqtt.connected())
    {
      Serial.println("MQTT Connected");
      JsonObject obj = doc.to<JsonObject>();
      obj["MQTT_USER"] = MQTT_USER;
      serializeJson(obj, output);
      mqtt.publish(MQTT_TOPIC_LOGIN, output);
      break;
    }
  }
}

void setup() {
  
  // put your setup code here, to run once:
  Serial.begin(9600);

  WiFi.begin(WIFI_SSID, WIFI_PASS); // Connect to the Wi-Fi (if not known use WifiManager from tzapu!)
  Serial.print("Setup Wi-Fi:");
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }
  WiFi.setAutoReconnect(true);
  WiFi.persistent(true);
  Serial.println();
  Serial.print("Connected:");
  Serial.println(WiFi.localIP());

  mqtt.setClient(wifi);    // Setup the MQTT client
  mqtt.setBufferSize(256); // override MQTT_MAX_PACKET_SIZE
  mqtt.setServer(MQTT_SERVER, MQTT_PORT);
  connectMQTT();

  ntp.begin();
}

void loop() {
  ntp.update();
  // put your main code here, to run repeatedly:
  
  JsonObject obj = doc.to<JsonObject>();
  obj["MQTT_USER"] = MQTT_USER;
  obj["Time"] = ntp.getFormattedTime();
  serializeJson(obj, output);
  mqtt.publish(MQTT_TOPIC_DATA, output);
  delay(10000);
}