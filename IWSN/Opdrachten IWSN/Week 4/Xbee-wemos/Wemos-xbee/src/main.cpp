#include <Arduino.h>
#include <SoftwareSerial.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>

WiFiClient client;
PubSubClient mqtt;

SoftwareSerial xbee(TX, RX);

int incoming = 0;

constexpr char MQTT_SERVER[] = "test.mosquitto.org";
constexpr int MQTT_PORT = 1883;

void connectMQTT(){
  while(!mqtt.connected()){
    mqtt.connect("iwsn-wemos-client-chiem");

    if(mqtt.connected()){
      Serial.println("MQTT Connected");
      mqtt.publish("iwsn-wemos-chiem", "Wemos Connected!");
      break;
    }
  }
}

void setup() {

  Serial.begin(9600);
  xbee.begin(9600);

  WiFi.begin("H368N", "MaElJoCh"); // Connect to the Wi-Fi (if not known use WifiManager from tzapu!)
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

  mqtt.setClient(client);  // Setup the MQTT client
  mqtt.setBufferSize(256); // override MQTT_MAX_PACKET_SIZE
  mqtt.setServer(MQTT_SERVER, MQTT_PORT);
  connectMQTT();
}

void loop() {
  if ( WiFi.status() == WL_CONNECTED ) {
    if ( !mqtt.connected() ) {
      connectMQTT();
    }
  } else {
    Serial.println("WiFi reconnection");
    WiFi.begin("H368N", "MaElJoCh"); // Connect to the Wi-Fi (if not known use WifiManager from tzapu!)
    //WiFi.reconnect();
    for ( unsigned int i=0; i < 20; ++i ) {
      if ( WiFi.status() != WL_CONNECTED ) {
        delay(1000);
        Serial.print(".");
          Serial.println();
          Serial.print("Connected:");
          Serial.println(WiFi.localIP());

      } else {
        i = 20;
      }
    }
  }

  mqtt.loop();
  // put your main code here, to run repeatedly:
  
  if(xbee.available()){

    String test = xbee.readString();
    Serial.println(test);

    if(mqtt.connected()){
      Serial.println("MQTT Connected");
      mqtt.publish("iwsn-wemos-chiem", test.c_str());
    }
    else {
      while(!mqtt.connected()){
        mqtt.connect("iwsn-wemos-client-chiem");

        if(mqtt.connected()){
          Serial.println("MQTT Connected");
          mqtt.publish("iwsn-wemos-chiem", test.c_str());
          break;
        }
      }
    }
  }
}