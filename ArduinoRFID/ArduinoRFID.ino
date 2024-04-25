// for SPI Communication
#include <SPI.h>
#include <PN532_SPI.h>
#include <PN532.h>
#include <NfcAdapter.h>
#include <NdefMessage.h>

PN532_SPI interface(SPI, 10);            // create a PN532 SPI interface with the SPI CS terminal located at digital pin 10
NfcAdapter nfc = NfcAdapter(interface);  // create an NFC adapter object
String tagId = "None";
NdefMessage message = NdefMessage();            // createa a message object
unsigned int count = message.getRecordCount();  // get the number of records
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
    String inputString = Serial.readStringUntil('\n');  // Read the incoming data as a string
    inputString.trim();                                 // Remove leading and trailing whitespaces
    if (inputString.equals("read")) {
      readNFC();
    }
    if (inputString[0] == 'r' && inputString[1] == '0') {
      int customRecordNumber = 0;
      readRecord(customRecordNumber);
    } else if (inputString[0] == 'r' && inputString[1] == '1') {
      int customRecordNumber = 1;
      readRecord(customRecordNumber);
    } else if (inputString[0] == 'r' && inputString[1] == '2') {
      int customRecordNumber = 2;
      readRecord(customRecordNumber);
    } else if (inputString[0] == 'r' && inputString[1] == '3') {
      int customRecordNumber = 3;
      readRecord(customRecordNumber);
    } else if (inputString[0] == 'w' && inputString[1] == '0' && inputString[2] == '/') {
      int customRecordNumber = 0;
      // find anything after / in the inputString
      String writeString = inputString.substring(inputString.indexOf("/") + 1);
      writeRecord(0, writeString);
    } else if (inputString[0] == 'w' && inputString[1] == '1' && inputString[2] == '/') {
      int customRecordNumber = 0;
      // find anything after / in the inputString
      String writeString = inputString.substring(inputString.indexOf("/") + 1);
      writeRecord(1, writeString);
    }else if (inputString[0] == 'w' && inputString[1] == '2' && inputString[2] == '/') {
      int customRecordNumber = 0;
      // find anything after / in the inputString
      String writeString = inputString.substring(inputString.indexOf("/") + 1);
      writeRecord(2, writeString);
    }else if (inputString[0] == 'w' && inputString[1] == '3' && inputString[2] == '/') {
      int customRecordNumber = 0;
      // find anything after / in the inputString
      String writeString = inputString.substring(inputString.indexOf("/") + 1);
      writeRecord(3, writeString);
    }else if (inputString.equals("erase")) {
      nfc.erase();
    }
    //  else if (inputString.equals("write")) {
    //   Serial.print("\n");


    //   String writeString = Serial.readString();  // Read the incoming data as a string
    //   writeString.trim();                        // Remove leading and trailing whitespaces

    //   Serial.println(writeString);

    //   message.addTextRecord(writeString);


    //   boolean success = nfc.write(message);
    //   if (success) {
    //     Serial.println("Success. Try reading this tag with your phone.");
    //   } else {
    //     Serial.println("Write failed");
    //   }
    // }
  }
}


void readNFC() {
  if (nfc.tagPresent()) {
    NfcTag tag = nfc.read();
    tag.print();
    tagId = tag.getUidString();
    NdefMessage message = tag.getNdefMessage();
    int recordCount = message.getRecordCount();
    Serial.print("Number of records on the tag: ");
    Serial.println(recordCount);
  }
  delay(5000);
}

void readRecord(int recordNumber) {
  if (nfc.tagPresent()) {
    NfcTag tag = nfc.read();
    Serial.println(tag.getTagType());
    Serial.print("UID: ");
    Serial.println(tag.getUidString());

    if (tag.hasNdefMessage())  // every tag won't have a message
    {

      NdefMessage message = tag.getNdefMessage();
      Serial.print("\nThis NFC Tag contains an NDEF Message with ");
      Serial.print(message.getRecordCount());
      Serial.print(" NDEF Record");
      if (message.getRecordCount() != 1) {
        Serial.print("s");
      }
      Serial.println(".");

      // cycle through the records, printing some info from each
      int recordCount = message.getRecordCount();
      // for (int i = 0; i < recordCount; i++) {
      Serial.print("\nNDEF Record ");
      Serial.println(recordNumber + 1);
      NdefRecord record = message.getRecord(recordNumber);
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
      if (uid == "") {
        record.setId(recordNumber, 4);
      } else if (uid != "") {
        Serial.print("  ID: ");
        Serial.println(uid);
      }
      // }
    }
  }
  delay(3000);
}

void writeRecord(int recordNumber, String payload) {
  if (nfc.tagPresent()) {
    NfcTag tag = nfc.read();
    Serial.println(tag.getTagType());
    Serial.print("UID: ");
    Serial.println(tag.getUidString());

    if (tag.hasNdefMessage())  // every tag won't have a message
    {
      NdefMessage message = tag.getNdefMessage();

      // Create a new NDEF message
      NdefMessage newMessage = NdefMessage();

      // Add all existing records to the new message up to the one being edited
      int recordCount = message.getRecordCount();
      for (int i = 0; i < recordCount; i++) {
        NdefRecord record = message.getRecord(i);
        if (i == recordNumber) {
          // Add your new record
          newMessage.addTextRecord(payload);
        } else {
          newMessage.addRecord(record);
        }
      }

      // If the record number is greater than the existing record count, add the new record at the end
      if (recordNumber >= recordCount) {
        newMessage.addTextRecord(payload);
      }

      // Erase the tag
      nfc.erase();

      // Write the new message to the tag
      boolean success = nfc.write(newMessage);
      if (success) {
        Serial.println("Success. Try reading this tag with your phone.");
      } else {
        Serial.println("Write failed");
      }
    }
  }
  delay(3000);
}