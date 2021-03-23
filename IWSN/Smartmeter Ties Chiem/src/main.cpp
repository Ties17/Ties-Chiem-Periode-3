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

WiFiUDP udp;
NTPClient ntp(udp, "pool.ntp.org", 3600);

DynamicJsonDocument doc(1024);
char output[2048];

//SoftwareSerial link(D7, D3);
#define P1_MAX_DATAGRAM_SIZE 1024
char p1_buf[P1_MAX_DATAGRAM_SIZE]; // Complete P1 telegram
char *p1;

// P1 statemachine
typedef enum
{
  P1_MSG_S0,
  P1_MSG_S1,
  P1_MSG_S2
} ENUM_P1_MSG_STATE;
ENUM_P1_MSG_STATE p1_msg_state = P1_MSG_S0;

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
      obj["Time"] = ntp.getEpochTime();
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
  ntp.forceUpdate();
  delay(5000);

  mqtt.setClient(wifi);     // Setup the MQTT client
  mqtt.setBufferSize(2048); // override MQTT_MAX_PACKET_SIZE
  mqtt.setServer(MQTT_SERVER, MQTT_PORT);
  connectMQTT();

  Serial.flush();
  Serial.begin(115200, SERIAL_8N1);
  delay(2000);
  Serial.swap();

  digitalWrite(PIN_GREEN, LOW);
  delay(2000);
  clearLed();
}

void publishData()
{
  digitalWrite(PIN_BLUE, LOW);
  JsonObject obj = doc.to<JsonObject>();
  obj["MQTT_USER"] = MQTT_USER;
  obj["Time"] = ntp.getEpochTime();
  obj["Data"] = p1_buf;
  serializeJson(obj, output);
  mqtt.publish(MQTT_TOPIC_DATA, output);
  delay(10);
  clearLed();
}

void p1_store(char ch)
{
  if ((p1 - p1_buf) < P1_MAX_DATAGRAM_SIZE)
  {
    *p1 = ch;
    p1++;
  }
}

void p1_reset()
{
  p1 = p1_buf;
  *p1 = '\0';
}

bool capture_p1()
{
  bool retval = false;

  if (Serial.available())
  {
    while (Serial.available())
    {
      char ch = Serial.read();
      switch (p1_msg_state)
      {

      //
      case P1_MSG_S0:
        if (ch == '/')
        {
          p1_msg_state = P1_MSG_S1;
          p1_reset();
          p1_store(ch);
        }
        break;

      //
      case P1_MSG_S1:
        p1_store(ch);
        if (ch == '!')
        {
          p1_msg_state = P1_MSG_S2;
        }
        break;

      //
      case P1_MSG_S2:
        p1_store(ch);
        if (ch == '\n')
        {
          p1_store('\0'); // Add 0 terminator
          p1_msg_state = P1_MSG_S0;
          retval = true;
        }
        break;

      //
      default:
        retval = false;
        break;
      }
    }
  }
  return retval;
}

void loop()
{
  // put your main code here, to run repeatedly:
  ntp.update();

  if (!mqtt.connected())
  {
    connectMQTT();
  }

  if (capture_p1() == true)
  {
    publishData();
    // Serial.println(p1_buf);
  }
  // delay(10000);
}