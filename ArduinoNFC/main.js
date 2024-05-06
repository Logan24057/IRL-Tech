// main.js
const { SerialPort } = require('serialport'); // Import the serialport module
const { ReadlineParser } = require('@serialport/parser-readline'); // Import the parser module
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8080');

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

    let isCommandPrompted = false;

    // Create a new parser instance
    const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }))

    // Open the port
    port.on("open", () => {
      console.log('Serial port open');
    });

    // Read the port data
    parser.on('data', data => {
      if (data.trim() !== 'Here are some commands that can be used: read, write, erase') {
        console.log(data);
      }
      if (!isCommandPrompted) {
        setTimeout(() => {
          readline.question('Commands: \n To write to specific records \n write \n To read specific records \n r0/  \n r1/ \n r2/ \n r3/ \n', command => {
            if (command) {
              var sendMessage = command + '\n'
              port.write(sendMessage)
              // readline.close();
            }
          });
          isCommandPrompted = true;
        }, 1000); // Delay of 1 second
      }
    });

    ws.on('message', message => {
      var sendMessage = message + '\n'
      port.write(sendMessage)
    });

  })

  // Writing to the port
  .catch((err) => console.log(err));