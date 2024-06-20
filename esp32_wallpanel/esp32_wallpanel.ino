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
    StaticJsonDocument<200> doc;
    String response;

    doc["command"] = input;

    if (input == "readInputs") {
      doc["outLight"]           = digitalRead(outLightPin);
      doc["cabin_battery"]      = 66;
      doc["van_battery"]        = 87;
      doc["water"]              = 54;
      doc["grey_water"]         = 98;
      doc["cabin_battery_volt"] = 13.8;
      doc["van_battery_volt"]   = 13.4;
    } else if (input == "outLightON") {
      digitalWrite(outLightPin, HIGH);
      doc["msg"]            = "Kanpoko argia piztuta";
    } else if (input == "outLightOFF") {
      digitalWrite(outLightPin, LOW);
      doc["msg"]            = "Kanpoko argia itzalita";
    }

    serializeJson(doc, response);
    Serial.println(response);
    SerialBT.println(response);
    
  }
}


