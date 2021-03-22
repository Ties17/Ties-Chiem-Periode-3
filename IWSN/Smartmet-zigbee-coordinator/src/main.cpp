#include <Arduino.h>
#include <XBee.h>
#include <SoftwareSerial.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <NTPClient.h>
#include <WiFiUdp.h>
#include <config.h>

//Time
WiFiUDP udp;
NTPClient ntp(udp, "pool.ntp.org", 3600);

//XBee
XBee xbee = XBee();
XBeeResponse response = XBeeResponse();
ZBRxResponse rx = ZBRxResponse();
ModemStatusResponse msr = ModemStatusResponse();
SoftwareSerial ssh(TX, RX);

//WiFi - MQTT
WiFiClient client;
PubSubClient mqtt;

String parseValuesToJson(String incoming) {

  //use delimiter (-) to receive values from xbee message
  String temp = incoming.substring(0, incoming.indexOf('-'));
  String hum = incoming.substring(incoming.indexOf('-') + 1, incoming.indexOf('-', incoming.indexOf('-') + 1));
  String bright = incoming.substring(incoming.indexOf('-', incoming.indexOf('-') + 1) + 1);

  StaticJsonDocument<128> doc;

  doc["temperature"] = temp.toFloat();
  doc["humidity"] = hum.toFloat();
  doc["brightness"] = bright.toInt();
  doc["timesend"] = ntp.getEpochTime();

  ssh.println(ntp.getEpochTime());

  String output;
  serializeJson(doc, output);
  return output;
}

void connectMQTT(){
  while(!mqtt.connected()){
    mqtt.connect(MQTT_TOPIC);

    if(mqtt.connected()){
      Serial.println("MQTT Connected");
      mqtt.publish(MQTT_SUBSCRIBE, "Wemos Connected!");
      break;
    }
  }
}

void setup() {
  //start serial
  ssh.begin(9600);
  xbee.begin(ssh);

  WiFi.begin(WIFI_USERNAME, WIFI_PASSWORD); // Connect to the Wi-Fi (if not known use WifiManager from tzapu!)
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

  ntp.begin();
  ntp.forceUpdate();
  delay(1000);

  mqtt.setClient(client);  // Setup the MQTT client
  mqtt.setBufferSize(256); // override MQTT_MAX_PACKET_SIZE
  mqtt.setServer(MQTT_SERVER, MQTT_PORT);
  connectMQTT();
}

void loop() {
    ntp.update();

    xbee.readPacket();
    
    if (xbee.getResponse().isAvailable()) {
      if (xbee.getResponse().getApiId() == ZB_RX_RESPONSE) {
        xbee.getResponse().getZBRxResponse(rx);

        uint8_t* xbeeFrameData = rx.getFrameData();
        int xbeeFrameDataLength = rx.getFrameDataLength();
        String message = "";
        for (int i = 11; i < xbeeFrameDataLength; i++) {
          message += (char)xbeeFrameData[i];
        }
        message = parseValuesToJson(message);
        mqtt.publish(MQTT_SUBSCRIBE, message.c_str());
        ssh.println(message);
      } 
    }
}
