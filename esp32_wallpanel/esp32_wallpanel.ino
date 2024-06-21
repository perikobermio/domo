#include "BluetoothSerial.h"
#include <ArduinoJson.h> 

BluetoothSerial SerialBT;

const String BTname   = "IratxoVan";
const String pass     = "d41d8cd98f00b204e9800998ecf8427e";
bool secureConn       = false;

const int outLightPin = 27;
const int waterPin    = 26;


void onConnect(esp_spp_cb_event_t event, esp_spp_cb_param_t *param) {
  if (event == ESP_SPP_CLOSE_EVT) {
    secureConn = false;
  }
}


void setup() {
    Serial.begin(115200);
    
    if (!SerialBT.begin(BTname)) {
      Serial.println("Bluetooth NOT CONNECTED");
    } else {
      SerialBT.register_callback(onConnect);
      Serial.println("Bluetooth CONNECTED");

      pinMode(outLightPin, OUTPUT);
      pinMode(waterPin, INPUT);
    }
}

void loop() {
  if (SerialBT.available()) {
    String input = SerialBT.readString();
    input.trim();
    StaticJsonDocument<200> doc;
    String response;

    doc["command"] = input;

    if(input == pass ) {
      secureConn = true;
    }
    if(!secureConn) {
      return;
    }

    if (input == "readInputs") {

      doc["outLight"]           = digitalRead(outLightPin);
      doc["cabin_battery"]      = 78;
      doc["van_battery"]        = 87;
      doc["water"]              = analogRead(waterPin);
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


