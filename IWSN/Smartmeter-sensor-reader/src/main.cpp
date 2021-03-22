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
  float mv = ( val/1024.0)*5000;
  float cel = mv/10;
  // Serial.print("TEMPRATURE = ");
  // Serial.print(cel);
  // Serial.print("*C");
  // Serial.println();

  // Reading temperature or humidity takes about 250 milliseconds!
  // Sensor readings may also be up to 2 seconds 'old' (its a very slow sensor)
  float hum = dht.readHumidity();

  // Check if any reads failed and exit early (to try again).
  if (isnan(hum)) {
    Serial.println(F("Failed to read from DHT sensor!"));
    hum = -1;
  }

  // Serial.print("Humidity: ");
  // Serial.print(hum);
  // Serial.println();

  int analogValue = analogRead(BRIGHTNESS);

  // Serial.print("Analog reading = ");
  // Serial.print(analogValue);   // the raw analog reading

  // // We'll have a few threshholds, qualitatively determined
  // if (analogValue < 10) {
  //   Serial.println(" - Dark");
  // } else if (analogValue < 200) {
  //   Serial.println(" - Dim");
  // } else if (analogValue < 500) {
  //   Serial.println(" - Light");
  // } else if (analogValue < 800) {
  //   Serial.println(" - Bright");
  // } else {
  //   Serial.println(" - Very bright");
  // }

  
  char tempStr[8];
  strcpy(tempStr, "");
  dtostrf(cel, 3, 2, &tempStr[strlen(tempStr)]);
  Serial.println(cel);
  Serial.println(tempStr);

  char humidStr[8];
  strcpy(humidStr, "");
  dtostrf(hum, 3, 2, &humidStr[strlen(humidStr)]);

  Serial.println(humidStr);

  char fullString[20];
  sprintf(fullString,"%s-%s-%i", tempStr,humidStr,analogValue);

  Serial.println(fullString);
  
  XBeeAddress64 addr64 = XBeeAddress64(0x0013A200, 0x419314B1);
  ZBTxRequest zbTx = ZBTxRequest(addr64, (uint8_t *)fullString, sizeof(fullString));
  xbee.send(zbTx);
}