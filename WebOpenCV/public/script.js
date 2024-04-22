document.addEventListener('DOMContentLoaded', function() {
    const takeSnapshotBtn = document.getElementById('takeSnapshotBtn');
    const video = document.getElementById('videoInput');
    const canvasOutput = document.getElementById('videoOutput');
    const circleCountBox = document.getElementById('circleCountBox');

    takeSnapshotBtn.addEventListener('click', takeSnapshot);

    function takeSnapshot() {
        const context = canvasOutput.getContext('2d');
        context.drawImage(video, 0, 0, canvasOutput.width, canvasOutput.height);

        const imageDataURL = canvasOutput.toDataURL('image/jpeg');
        sendSnapshotToServer(imageDataURL);
    }

    async function sendSnapshotToServer(imageDataURL) {
        try {
            const response = await fetch('/process_video', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ image_data: imageDataURL })
            });

            const data = await response.json();
            updateUI(data.circle_count);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    function updateUI(circleCount) {
        circleCountBox.innerText = `Number of circles detected: ${circleCount}`;
    }

    // Setup video stream
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function(stream) {
            video.srcObject = stream;
            video.play();
        })
        .catch(function(err) {
            console.error('Error accessing the webcam: ', err);
        });
});