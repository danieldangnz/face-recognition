const video = document.getElementById("video");

Promise.all([
  faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
]).then(startWebcam);

function startWebcam() {
  navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: false,
    })
    .then((stream) => {
      video.srcObject = stream;
    })
    .catch((error) => {
      console.error(error);
    });
}

function getLabeledFaceDescriptions() {
  const labels = ["Daniel", "Pia", "Huong", "Andy"]; // add more names as per your dataset
  return Promise.all(
    labels.map(async (label) => {
      const descriptions = [];
      for (let i = 1; i <= 3; i++) {
        const img = await faceapi.fetchImage(`/labels/${label}/${i}.jpg`);
        const detection = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
        descriptions.push(detection.descriptor);
      }
      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  );
}

video.addEventListener("play", async () => {
  const labeledFaceDescriptors = await getLabeledFaceDescriptions();
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);

  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);

  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video)
      .withFaceLandmarks()
      .withFaceDescriptors();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    const results = resizedDetections.map((d) => {
      return faceMatcher.findBestMatch(d.descriptor);
    });
    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box;
      const drawBox = new faceapi.draw.DrawBox(box, {
        label: result,
      });
      drawBox.draw(canvas);
    });
  }, 100);
});






/*

//Get access to the video element
const video = document.getElementById('video');

//Write a function that starts the webcam
function startWebcam() {
  navigator.mediaDevices.getUserMedia(
    { "video": true,
      "audio": false
    }).then( (stream) => {
      video.srcObject = stream;
    }).catch( (err) => {console.error("Error accessing webcam: ", err) } )
};
// Start the webcam as soon as the script loads
// startWebcam(); --JUST FOR TESTING



//NEED TO UPDATE THIS FUNCTION TO START VIDEO AND LOAD LABELLED IMAGES
//Load the models from the models folder - need to wait for them to load before starting the video
Promise.all([
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),   
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models')
]).then(startWebcam).then(loadLabeledImages).then(recognizeFaces);




//Load labelled images and create face descriptors
function loadLabeledImages() {
  //You can add more names here if you want
  const labels = ['Pia', 'Huong', 'Daniel', 'Andy'];  //Names of people in the dataset
  
  //For each person, we need 5 images (we have stored them in labels/<name>/<number>.jpg)  
  return Promise.all(
    labels.map( async (label) => {
      //We need to convert each image to a face description (a set of numerical values)
      const descriptions = [];    
      //We need 5 images for each person and named them 1.png, 2.png, 3.png, 4.png. 5.png
      for (let i=1; i<=3; i++) {
        const img = await faceapi.fetchImage(`./labels/${label}/${i}.png`);
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
        descriptions.push(detections.descriptor);
      }
      //Return the face description for the person
      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  );
}


function recognizeFaces(labeledFaceDescriptors) {
  //Create a face matcher with a threshold of 0.6 (default is 0.6, lower = more strict)
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);   

  //Create a canvas from the video element
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  //Run the following code every 100 milliseconds
  setInterval( async () => {
    //Detect all faces in the video element
    const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();
    //Resize the detected boxes to match the display size
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    //Clear the canvas before drawing
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    //For each detected face, find the best match from the labeled descriptors
    const results = resizedDetections.map( (d) => {
      return faceMatcher.findBestMatch(d.descriptor);
    } );

    //Draw the boxes and labels on the canvas
    results.forEach( (result, i) => {
      const box = resizedDetections[i].detection.box; 
      const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() });
      drawBox.draw(canvas);
    } );
  }, 100);
}

*/




