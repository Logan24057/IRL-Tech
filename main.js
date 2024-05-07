// Description: This file is used to read and write data to the serial port.

//Sets the requirements for the application
const { SerialPort } = require('serialport'); // Import the serialport module
const { ReadlineParser } = require('@serialport/parser-readline'); // Import the parser module
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

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

    //Initaites prompt loop
    var isCommandPrompted = true;

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
      if (isCommandPrompted) {
        setTimeout(() => {
          //Asks for the command you want to use
          readline.question('Commands: \n To write to specific records \n w0/ Your Message \n w1/ Your Message \n w2/ Your Message \n w3/ Your Message \n To read specific records \n r0/  \n r1/ \n r2/ \n r3/ \n', command => {
            if (command) {
              var sendMessage = command + '\n'
              port.write(sendMessage)
            }
            readline.close();
            //Closes prompt loop
            isCommandPrompted = false;
          });
        }, 500); // Delay of 1 second
      }
    });

  })

  // Writing to the port
  .catch((err) => console.log(err));
