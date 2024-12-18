// Accessing the video element and object names list
const video = document.getElementById("video");
const objectNamesList = document.getElementById("object-names");
const buzzerSound = document.getElementById("buzzer");

// Accessing the camera stream
navigator.mediaDevices
  .getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
  })
  .catch((err) => {
    console.error("Error accessing the camera: ", err);
  });

// Loading the COCO-SSD model
let model;
cocoSsd.load().then((loadedModel) => {
  model = loadedModel;
  console.log("COCO-SSD model loaded!");
});

// Function to perform object detection
async function detectObjects() {
  // Run the object detection on the video feed
  const predictions = await model.detect(video);

  // Access the canvas element and its context
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  // Clear any previous drawings on the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Clear the previous list of objects in the sidebar
  objectNamesList.innerHTML = '';

  // Array to store object names (to prevent duplicate entries in the sidebar)
  const detectedObjectNames = [];

  // Draw the bounding boxes and labels for each detected object
  predictions.forEach((prediction) => {
    // Draw the bounding box
    ctx.beginPath();
    ctx.rect(
      prediction.bbox[0], // x
      prediction.bbox[1], // y
      prediction.bbox[2], // width
      prediction.bbox[3]  // height
    );
    ctx.lineWidth = 3;
    ctx.strokeStyle = "red";
    ctx.fillStyle = "red";
    ctx.stroke();

    // Draw the label and confidence score on the canvas
    const label = `${prediction.class} (${Math.round(prediction.score * 100)}%)`;
    const labelWidth = ctx.measureText(label).width;

    // Draw background for the label
    ctx.fillStyle = "white";
    ctx.fillRect(prediction.bbox[0], prediction.bbox[1] - 20, labelWidth + 10, 20);

    // Draw the label text
    ctx.fillStyle = "black";
    ctx.fillText(label, prediction.bbox[0] + 5, prediction.bbox[1] - 5);

    // Store the object name in the detectedObjectNames array if not already present
    if (!detectedObjectNames.includes(prediction.class)) {
      detectedObjectNames.push(prediction.class);

      // Add the object name and score to the sidebar list
      const listItem = document.createElement("li");
      listItem.innerHTML = `<span>${prediction.class}:</span> ${Math.round(prediction.score * 100)}%`;
      objectNamesList.appendChild(listItem);

      // If a "person" is detected, play the buzzer sound
      if (prediction.class === "person") {
        buzzerSound.play();
      }
    }
  });
}

// Call the detectObjects function every 100 ms
function startDetection() {
  setInterval(detectObjects, 100);
}

// Start the object detection when the video starts playing
video.addEventListener("play", startDetection);
