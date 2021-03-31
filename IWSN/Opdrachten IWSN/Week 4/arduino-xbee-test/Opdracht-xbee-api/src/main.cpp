#include <Arduino.h>
#include <XBee.h>

XBee xbee = XBee();
XBeeResponse response = XBeeResponse();
// create reusable response objects for responses we expect to handle 
ZBRxResponse rx = ZBRxResponse();
ModemStatusResponse msr = ModemStatusResponse();

void setup() {
  
  // start serial
  Serial.begin(9600);
  xbee.begin(Serial);
}

// continuously reads packets, looking for ZB Receive or Modem Status
void loop() {
    
    xbee.readPacket();
    
    if (xbee.getResponse().isAvailable()) {
      // got something
      
      if (xbee.getResponse().getApiId() == ZB_RX_RESPONSE) {
        // got a zb rx packet
        
        // now fill our zb rx class
        xbee.getResponse().getZBRxResponse(rx);
            
        if (rx.getOption() == ZB_PACKET_ACKNOWLEDGED) {
            // the sender got an ACK
        } else {
            // we got it (obviously) but sender didn't get an ACK
        }
        // set dataLed PWM to value of the first byte in the data
        Serial.println("test 1");
        uint8_t* test = rx.getFrameData();

        for (int i = 0; i < 4; i++) {
          Serial.println(test[i]);
        }
      } else if (xbee.getResponse().getApiId() == MODEM_STATUS_RESPONSE) {
        xbee.getResponse().getModemStatusResponse(msr);
        // the local XBee sends this response on certain events, like association/dissociation
        
        if (msr.getStatus() == ASSOCIATED) {
          // yay this is great.  flash led
        } else if (msr.getStatus() == DISASSOCIATED) {
          // this is awful.. flash led to show our discontent

        } else {
          // another status

        }
        Serial.println("test 2");
      } else {
        // not something we were expecting   
      }
    } else if (xbee.getResponse().isError()) {
      //nss.print("Error reading packet.  Error code: ");  
      //nss.println(xbee.getResponse().getErrorCode());
    }
}