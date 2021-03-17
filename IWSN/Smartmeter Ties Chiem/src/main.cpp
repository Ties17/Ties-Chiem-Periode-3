#include <Arduino.h>
#include <PubSubClient.h>
#include <ESP8266WiFi.h>
#include <SoftwareSerial.h>
#include <ArduinoJson.h>
#include <SmartmeterConfig.h>
#include <NTPClient.h>
#include <WiFiUdp.h>

#define P1_MAX_DATAGRAM_SIZE 1024
char p1_buf[P1_MAX_DATAGRAM_SIZE]; // Complete P1 telegram
char *p1;

WiFiClient wifi;
PubSubClient mqtt;
SoftwareSerial p1;

WiFiUDP udp;
NTPClient ntp(udp, "pool.ntp.org", 3600);

DynamicJsonDocument doc(1024);
char output[2048];

SoftwareSerial link(D7, D3);

String buffer;

void clearLed()
{
  digitalWrite(PIN_RED, HIGH);
  digitalWrite(PIN_GREEN, HIGH);
  digitalWrite(PIN_BLUE, HIGH);
}

void connectMQTT()
{
  while (!mqtt.connected())
  {
    mqtt.connect("SMARTMETER-TIES");
    digitalWrite(PIN_RED, LOW);
    digitalWrite(PIN_GREEN, LOW);
    if (mqtt.connected())
    {
      Serial.println("MQTT Connected");
      JsonObject obj = doc.to<JsonObject>();
      obj["MQTT_USER"] = MQTT_USER;
      obj["Time"] = ntp.getFormattedTime();
      serializeJson(obj, output);
      mqtt.publish(MQTT_TOPIC_LOGIN, output);
      clearLed();
      break;
    }
    clearLed();
  }
}

void setup()
{

  pinMode(PIN_RED, OUTPUT);   // green
  pinMode(PIN_GREEN, OUTPUT); // blue
  pinMode(PIN_BLUE, OUTPUT);  // red

  clearLed();

  Serial.begin(9600);
  link.begin(115200, SWSERIAL_8N1);

  WiFi.begin(WIFI_SSID, WIFI_PASS); // Connect to the Wi-Fi (if not known use WifiManager from tzapu!)
  Serial.print("Setup Wi-Fi:");
  while (WiFi.status() != WL_CONNECTED)
  {
    clearLed();
    delay(500);
    digitalWrite(PIN_RED, LOW);
    Serial.print(".");
    delay(5);
  }
  WiFi.setAutoReconnect(true);
  WiFi.persistent(true);
  Serial.println();
  Serial.print("Connected:");
  Serial.println(WiFi.localIP());

  ntp.begin();
  ntp.update();

  mqtt.setClient(wifi);    // Setup the MQTT client
  mqtt.setBufferSize(256); // override MQTT_MAX_PACKET_SIZE
  mqtt.setServer(MQTT_SERVER, MQTT_PORT);
  connectMQTT();

  digitalWrite(PIN_GREEN, LOW);
  delay(2000);
  clearLed();
}

void p1_store(char c)
{
  if ((p1 - p1_buf) < P1_MAX_DATAGRAM_SIZE)
  {
    *p1 = c;
    p1++;
  }
}

void p1_reset()
{
  p1 = p1_buf;
  *p1 = '\0';
}

bool waiting = true;

void loop()
{
  // put your main code here, to run repeatedly:
  ntp.update();

  if (link.available())
  {
    while (link.available())
    {
      char c = link.read();

      if (c == '/')
      {
        waiting = false;
        p1_reset();
      }
      p1_store(c);
      if (c == '\n')
      {
        p1_store('\0');
        waiting = true;
      }
      // --- 7 bits instelling ---
      // c &= ~(1 << 7);
      // buffer += c;
    }
  }

  if (!waiting)
  {
    digitalWrite(PIN_GREEN, LOW);
  }
  else
  {
    clearLed();
    Serial.println(p1_buf);
  }

  // JsonObject obj = doc.to<JsonObject>();
  // obj["MQTT_USER"] = MQTT_USER;
  // obj["Time"] = ntp.getFormattedTime();
  // serializeJson(obj, output);
  // mqtt.publish(MQTT_TOPIC_DATA, output);
  // delay(10000);
}