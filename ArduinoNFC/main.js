// Import the necessary modules
const { SerialPort } = require('serialport'); // Serial communication
const { ReadlineParser } = require('@serialport/parser-readline'); // Parsing serial data
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// Declare variables for the serial port and a pending command
let port;
let pendingCommand;

// List all available serial ports
SerialPort.list()
  .then((ports) => {
    // Create a new SerialPort instance
    port = new SerialPort({
      path: 'COM4', // The port path
      baudRate: 115200, // The baud rate
      autoOpen: true, // Automatically open the port
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
      // If the data received is not the command list, print it
      if (data.trim() !== 'Here are some commands that can be used: read, write, erase') {
        console.log(data);
      }
      // If the command prompt has not been shown yet
      if (!isCommandPrompted) {
        // Delay the command prompt by 1 second
        setTimeout(() => {
          // Prompt the user for a command
          readline.question('Commands: \n To write to specific records \n write \n To read specific records \n r0/  \n r1/ \n r2/ \n r3/ \n', command => {
            // If a command is entered, send it to the port
            if (command) {
              var sendMessage = command + '\n'
              port.write(sendMessage)
            }
          });
          // Set the flag to true to indicate that the command prompt has been shown
          isCommandPrompted = true;
        }, 1000); // Delay of 1 second
      }
    });
  })
  .catch((err) => console.log(err)); // Log any errors

// Function to write to the port
function writeToPort(command, callback) {
  // Check if the port is initialized
  if (port) {
    // Write the command to the port with a newline character
    port.write(command + '\n');
    // If a callback function is provided, execute it once data is received
    if (callback && typeof callback === 'function') {
      port.once('data', callback);
    }
  } else {
    // If the port is not initialized yet, store the command to be sent later
    pendingCommand = command;
  }
}

// Function to read from the port
function readFromPort(command, callback) {
  // Check if the port is initialized
  if (port) {
    // Initialize a variable to store the chunks of data
    let dataChunks = '';
    // Write the command to the port with a newline character
    port.write(command + '\n');
    // Set up a listener for data event
    port.on('data', (data) => {
      // Concatenate the received data to the dataChunks variable
      dataChunks += data.toString();
      // If the received data ends with a newline character, call the callback function with the dataChunks
      if (data.toString().endsWith('\n')) {
        callback(dataChunks);
        // Remove the data event listener once we're done to prevent memory leaks
        port.removeAllListeners('data');
      }
    });
  } else {
    // If the port is not initialized yet, store the command to be sent later
    pendingCommand = command;
  }
}

// Export the functions
module.exports = { writeToPort, readFromPort };