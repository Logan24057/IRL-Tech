// for SPI Communication
#include <SPI.h>
#include <PN532_SPI.h>
#include <PN532.h>
#include <NfcAdapter.h>
#include <NdefMessage.h>
#include <NdefRecord.h>
#include <NfcTag.h>
PN532_SPI interface(SPI, 10);            // create a PN532 SPI interface with the SPI CS terminal located at digital pin 10
NfcAdapter nfc = NfcAdapter(interface);  // create an NFC adapter object
String tagId = "None";
NdefMessage message = NdefMessage();     // create a a message object
int count = message.getRecordCount(); // get the number of records
int incomingByte = 0; // for incoming serial data
void setup(void) {
  //serial.write and serial.send
  Serial.begin(115200);
  Serial.println("System initialized");

  
  nfc.begin();
  // Serial.print("\n");
  // Serial.print("Here are some commands that can be used:");
  // Serial.print("\n");
  // Serial.print("read");
  // Serial.print("\n");
  // Serial.print("write");
  // Serial.print("\n");
  // Serial.print("erase");
  // Serial.print("\n");
  // Serial.print("\n");
}

void loop() {

  while (Serial.available() > 0) {
    String inputString = Serial.readString();  // Read the incoming data as a string
    inputString.trim();                        // Remove leading and trailing whitespaces

    if (inputString.equals("read")) {  // Compare the received string with "read"
      Serial.print("\n");
      Serial.print("Would you like to search for a record? (y/n) ");
      while (!Serial.available()) {
        // Wait for user input
      }
      String answer = Serial.readString();
      answer.trim();
      Serial.println("Answer: " + answer);  // Print the user's answer
      if (answer.equals("y")) {
        Serial.print("\n");
        Serial.print("please enter your record index. remember the first records index is 0 ");
        while (!Serial.available()) {
          // Wait for user input
        }
        String answer = Serial.readString();
        answer.trim();
        int index = answer.toInt();
        Serial.println("Answer: " + answer);  // Print the user's answer
        if (index >= 0 && index < message.getRecordCount()) {
          NdefRecord record = message.getRecord(index);  // Get the record at the specified index

          // Get the payload
          int payloadLength = record.getPayloadLength();
          byte payload[payloadLength];
          record.getPayload(payload);

          // Convert the payload to a string
          String payloadAsString = "";
          for (int c = 0; c < payloadLength; c++) {
            payloadAsString += (char)payload[c];
          }

          // Print the payload
          Serial.print("Payload: ");
          Serial.println(payloadAsString);
        } else {
          Serial.println("Invalid record index");
        }
      } else if (answer.equals("n")) {
        Serial.println("Calling readNFC()");  // Confirm that readNFC() is being called
        readNFC();
      }
    } else if (inputString.equals("erase")) {
      nfc.erase();
    } else if (inputString.equals("write")) {
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
  String receivedString;

  if (Serial.available()) {
    receivedString = Serial.readStringUntil('\n');
    Serial.print("received ");
    Serial.println(receivedString);
    // int receivedStringLength = receivedString.length();
    Serial.println(receivedString.length());
    if (receivedString[0] == 'w' && receivedString[1] == '/'){
        String command = receivedString.substring(2, 3);
        Serial.println(command);

    }
  }


}




void readNFC() {
  if (nfc.tagPresent()) {
    NfcTag tag = nfc.read();
    tag.print();
    tagId = tag.getUidString();
    if (tag.hasNdefMessage())  // every tag won't have a message
    {
      message = tag.getNdefMessage();  // Use the global message object
      Serial.print("\nThis NFC Tag contains an NDEF Message with ");
      Serial.print(message.getRecordCount());
      Serial.print(" NDEF Record");
      if (message.getRecordCount() != 1) {
        Serial.print("s");
      }
      Serial.println(".");

      // cycle through the records, printing some info from each
      int recordCount = message.getRecordCount();
      for (int i = 0; i < recordCount; i++) {
        Serial.print("\nNDEF Record ");
        Serial.println(i + 1);
        NdefRecord record = message.getRecord(i);
        // NdefRecord record = message[i]; // alternate syntax

        Serial.print("  TNF: ");
        Serial.println(record.getTnf());
        Serial.print("  Type: ");
        Serial.println(record.getType());  // will be "" for TNF_EMPTY

        // The TNF and Type should be used to determine how your application processes the payload
        // There's no generic processing for the payload, it's returned as a byte[]
        int payloadLength = record.getPayloadLength();
        byte payload[payloadLength];
        record.getPayload(payload);

        // Print the Hex and Printable Characters
        Serial.print("  Payload (HEX): ");
        PrintHexChar(payload, payloadLength);

        // Force the data into a String (might work depending on the content)
        // Real code should use smarter processing
        String payloadAsString = "";
        for (int c = 0; c < payloadLength; c++) {
          payloadAsString += (char)payload[c];
        }
        Serial.print("  Payload (as String): ");
        Serial.println(payloadAsString);

        // id is probably blank and will return ""
        String uid = record.getId();
        if (uid != "") {
          Serial.print("  ID: ");
          Serial.println(uid);
        }
      }
    }
  }
  delay(5000);
}