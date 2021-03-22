#include <Arduino.h>
#include "DHT.h"
#include <XBee.h>

#define DHTPIN 4
#define DHTTYPE DHT11   

#define TEMPPIN 1
#define BRIGHTNESS A0

DHT dht(DHTPIN, DHTTYPE);
XBee xbee = XBee();

void setup()
{
  Serial.begin(9600);
  xbee.setSerial(Serial);
  dht.begin();
}

void loop()
{
  delay(10000);

  int val = analogRead(TEMPPIN);
  //convert temperature value to celcius
  float mv = ( val/1024.0)*5000;
  float cel = mv/10;

  float hum = dht.readHumidity();

  // Check if any reads failed and exit early (to try again).
  if (isnan(hum)) {
    Serial.println(F("Failed to read from DHT sensor!"));
    hum = -1;
  }

  int brightness = analogRead(BRIGHTNESS);

  char tempStr[8];
  strcpy(tempStr, "");
  dtostrf(cel, 3, 2, &tempStr[strlen(tempStr)]);

  char humidStr[8];
  strcpy(humidStr, "");
  dtostrf(hum, 3, 2, &humidStr[strlen(humidStr)]);

  char fullString[20];
  sprintf(fullString,"%s-%s-%i", tempStr,humidStr,brightness);

  XBeeAddress64 addr64 = XBeeAddress64(0x0013A200, 0x419314B1);
  ZBTxRequest zbTx = ZBTxRequest(addr64, (uint8_t *)fullString, sizeof(fullString));
  xbee.send(zbTx);
}