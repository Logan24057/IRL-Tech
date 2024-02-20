const { SerialPort } = require('serialport');

SerialPort.list()
  .then((ports) => {
    ports.forEach((port) => {
      console.log(port.path);
      console.log(port)
    });

    // Create a new SerialPort instance
    const port = new SerialPort('COM4', {
      baudRate: 115200,
      autoOpen: true,
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
