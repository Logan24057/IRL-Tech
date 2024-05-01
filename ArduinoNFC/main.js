// main.js
const { SerialPort } = require('serialport'); // Import the serialport module
const { ReadlineParser } = require('@serialport/parser-readline'); // Import the parser module
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let port;
let pendingCommand;

SerialPort.list()
  .then((ports) => {
    // Create a new SerialPort instance
    port = new SerialPort({
      path: 'COM4',
      baudRate: 115200,
      autoOpen: true,
    });
    // If there's a pending command, write it to the port
    if (pendingCommand) {
      port.write(pendingCommand + '\n');
      pendingCommand = null;
    }

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
  })
  .catch((err) => console.log(err));

  function writeToPort(command, callback) {
    if (port) {
        port.write(command + '\n');
        if (callback && typeof callback === 'function') {
            port.once('data', callback);
        }
    } else {
        // If the port is not initialized yet, store the command
        pendingCommand = command;
    }
}

function readFromPort(command, callback) {
  if (port) {
      let dataChunks = '';
      port.write(command + '\n');
      port.on('data', (data) => {
          dataChunks += data.toString();
          if (data.toString().endsWith('\n')) {
              callback(dataChunks);
              port.removeAllListeners('data'); // remove the listener once we're done
          }
      });
  } else {
      // If the port is not initialized yet, store the command
      pendingCommand = command;
  }
}

module.exports = { writeToPort, readFromPort };