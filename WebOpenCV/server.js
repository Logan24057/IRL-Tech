const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cv = require('opencv4nodejs');

app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static('public'));

// Route for serving the HTML file
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

// Route for processing video frames
app.post('/process_video', (req, res) => {
    const imageDataURL = req.body.image_data;
    const base64Data = imageDataURL.replace(/^data:image\/jpeg;base64,/, '');

    // Convert base64 image data to Buffer
    const buf = Buffer.from(base64Data, 'base64');
    const img = cv.imdecode(buf);

    // Apply transformations to the frame
    const gray = img.bgrToGray();
    const blurred = gray.gaussianBlur(new cv.Size(7, 7), 0);

    // Detect circles in the transformed frame
    const circles = blurred.houghCircles(
        cv.HOUGH_GRADIENT, 1, 20, 100, 30, 0, 0
    );

    const circleCount = circles.cols;

    res.json({ circle_count: circleCount });
});

// Start the server and have it listen on the defined port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});