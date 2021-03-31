#include <Arduino.h>
#include <XBee.h>
#include <SoftwareSerial.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>

XBee xbee = XBee();
XBeeResponse response = XBeeResponse();
// create reusable response objects for responses we expect to handle 
ZBRxResponse rx = ZBRxResponse();
ModemStatusResponse msr = ModemStatusResponse();
SoftwareSerial ssh(TX, RX);

WiFiClient client;
PubSubClient mqtt;


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
  //start serial
  ssh.begin(9600);
  xbee.begin(ssh);

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

// continuously reads packets, looking for ZB Receive or Modem Status
void loop() {
    
    xbee.readPacket();
    
    if (xbee.getResponse().isAvailable()) {
      if (xbee.getResponse().getApiId() == ZB_RX_RESPONSE) {
        xbee.getResponse().getZBRxResponse(rx);

        uint8_t* test = rx.getFrameData();
        int test2 = rx.getFrameDataLength();
        String message = "";
        for (int i = 11; i < test2; i++) {
          message += (char)test[i];
        }
        mqtt.publish("iwsn-wemos-chiem", message.c_str());
        ssh.println(message);
      } 
    }
}
