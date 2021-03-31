#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <SoftwareSerial.h>

WiFiClient client;
PubSubClient mqtt;
SoftwareSerial xbee(TX, RX);

String incoming = "";

constexpr char MQTT_SERVER[] = "test.mosquitto.org";
constexpr int MQTT_PORT = 1883;

void connectMQTT(){
  while(!mqtt.connected()){
    mqtt.connect("iwsn-wemos-client-ties");
    
    if(mqtt.connected()){
      Serial.println("MQTT Connected");
      mqtt.publish("iwsn-wemos-ties", "Wemos Connected!");
      break;
    }
  }
}

void setup() {
  Serial.begin(9600);
  xbee.begin(9600);

  WiFi.begin("Ties Netwerk 2.4", "TiesWifi2.4"); // Connect to the Wi-Fi (if not known use WifiManager from tzapu!)
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
  // put your main code here, to run repeatedly:
  if(xbee.available()){
    incoming = xbee.readString();
    Serial.println(incoming);
    mqtt.publish("iwsn-wemos-ties", incoming.c_str());
  }

  xbee.write("test data sturen via xbee");
}
