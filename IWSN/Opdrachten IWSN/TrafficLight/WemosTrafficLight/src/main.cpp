#include <Arduino.h>

#include <fsm.h>

ENUM_STATE state = STATE_START;

void setup() {

  Serial.begin(9600);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000);
  digitalWrite(LED_BUILTIN, LOW);
  delay(1000);
}