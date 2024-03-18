// Import the express module
const express = require('express');

// Create an instance of express
const app = express();

// Import the path module
const path = require('path');

// Define the port the server will listen on
const PORT = 3000;

// Set the directory where express will look for view templates
app.set('views', path.join(__dirname, 'views'));

// Set the view engine to ejs
app.set('view engine', 'ejs');

// Serve static files (like CSS, JavaScript, and images) from the "scripts" directory
app.use('/scripts', express.static(path.join(__dirname, 'scripts')));

// Define a route handler for GET requests made to the root path ('/')
app.get('/', function(req, res) {
    // Render the 'test' view when the route is accessed
    res.render('test');
});

// Start the server and have it listen on the defined port
app.listen(PORT, () => {
  // Log a message to the console once the server starts successfully
  console.log(`Server is running on port ${PORT}`);
});