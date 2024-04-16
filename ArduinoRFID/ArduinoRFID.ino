// for SPI Communication
#include <SPI.h>
#include <PN532_SPI.h>
#include <PN532.h>
#include <NfcAdapter.h>
#include <NdefMessage.h>

PN532_SPI interface(SPI, 10);            // create a PN532 SPI interface with the SPI CS terminal located at digital pin 10
NfcAdapter nfc = NfcAdapter(interface);  // create an NFC adapter object
String tagId = "None";
NdefMessage message = NdefMessage();     // createa a message object
int count = message.getRecordCount(); // get the number of records
int incomingByte = 0; // for incoming serial data
void setup(void) {
  //serial.write and serial.send
  Serial.begin(115200);
  Serial.println("System initialized");

  
  nfc.begin();
  Serial.print("\n");
  Serial.print("Here are some commands that can be used:");
  Serial.print("\n");
  Serial.print("read");
  Serial.print("\n");
  Serial.print("write");
  Serial.print("\n");
  Serial.print("erase");
  Serial.print("\n");
  Serial.print("\n");
}

void loop() {

   while (Serial.available() > 0) {
    String inputString = Serial.readString();  // Read the incoming data as a string
    inputString.trim();                        // Remove leading and trailing whitespaces

    if (inputString.equals("read")) {  // Compare the received string with "read"
      readNFC();                       // Do something if the received string is "read"
      Serial.print(count);
      message.getRecord(0);
    }
    else if (inputString.equals("erase")){
      nfc.erase();
    }
    else if (inputString.equals("write")) {
      Serial.print("\n");
      Serial.println("What would you like to write?");

      while (!Serial.available()) {
        // Wait for user input
      }
      
      String writeString = Serial.readString();  // Read the incoming data as a string
      writeString.trim();                        // Remove leading and trailing whitespaces
      
      Serial.println(writeString);

      message.addTextRecord(writeString);
      // message.addTextRecord(writeString);
      // message.addEmptyRecord();

      boolean success = nfc.write(message);
      if (success) {
        Serial.println("Success. Try reading this tag with your phone.");
      } else {
        Serial.println("Write failed");
      }
    }
  // send data only when you receive data:
  }
  if (Serial.available() > 0) {
    // read the incoming byte:
     incomingByte = Serial.read();

    // say what you got:
    Serial.print("I received: ");
    Serial.println(incomingByte, HEX); 
  }
}




void readNFC() {
  if (nfc.tagPresent()) {
    NfcTag tag = nfc.read();
    tag.print();
    tagId = tag.getUidString();
  }
  delay(5000);
}
