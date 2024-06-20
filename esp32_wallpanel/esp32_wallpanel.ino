#include "BluetoothSerial.h"
#include <ArduinoJson.h> 

BluetoothSerial SerialBT;

const int outLightPin = 27;

void setup() {
    Serial.begin(115200);
    
    if (!SerialBT.begin("HELLboard")) {
      Serial.println("Bluetooth NOT CONNECTED");
    } else {
      Serial.println("Bluetooth CONNECTED");
      pinMode(outLightPin, OUTPUT);
    }
}

void loop() {
  if (SerialBT.available()) {
    String input = SerialBT.readString();
    input.trim();
    Serial.println(input);

    if (input == "readInputs") {
      StaticJsonDocument<200> doc;
      doc["outLight"]       = digitalRead(outLightPin);
      doc["cabin_battery"]  = 66;
      doc["van_battery"]    = 87;
      doc["water"]          = 54;
      doc["grey_water"]     = 98;

      String inputs;
      serializeJson(doc, inputs);

      Serial.println(inputs);
      SerialBT.println(inputs);
    } else if (input == "outLightON") {
      digitalWrite(outLightPin, HIGH);
      Serial.println("Kanpoko argia piztuta");
    } else if (input == "outLightOFF") {
      digitalWrite(outLightPin, LOW);
      Serial.println("Kanpoko argia itzalita");
    }
    
  }
  delay(500);
}
