// Description: This file is used to read and write data to the serial port.

const { SerialPort } = require('serialport'); // Import the serialport module
const { ReadlineParser } = require('@serialport/parser-readline'); // Import the parser module

// List all available ports
SerialPort.list()
  .then((ports) => {
    ports.forEach((port) => {
      console.log(port.path);
      console.log(port)
    });

    // Create a new SerialPort instance
    const port = new SerialPort({
      path: 'COM4',
      baudRate: 115200,
      autoOpen: true,
    });

    // Create a new parser instance
    const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }))

    // Read the port data
    port.on("open", () => {
      console.log('serial port open');
    });

    // Log the data
    parser.on('data', data => {
      console.log('got word from arduino:', data);
    });

    // Writing to the port
    port.write('1', (err) => {
      if (err) {
        return console.log('Error on write: ', err.message);
      }
      console.log('Message written');
    });
  })
  .catch((err) => console.log(err));
