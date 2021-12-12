// Array for shader sandboxes and canvases. 
var sandbox = []; 
var canvas = []; 

var stream; var recordedChunks = []; var mediaRecorder; 
var options = { mimeType: 'video/webm; codecs=vp9' };
// ------------------------------- Sketch Setup ------------------------------
function setup() {
  canvas[0] = document.getElementById("glslCanvasA"); 
  canvas[1] = document.getElementById("glslCanvasB"); 
  canvas[2] = document.getElementById("glslCanvasC"); 
  canvas[3] = document.getElementById("glslCanvasD"); 
  // canvas[4] = document.getElementById("glslCanvasE"); 
  // canvas[5] = document.getElementById("glslCanvasF"); 
  // canvas[6] = document.getElementById("glslCanvasG"); 
  // canvas[7] = document.getElementById("glslCanvasH"); 

  // 4 canvases on the top and 4 below
  let canvasSize = [windowWidth/2, windowHeight/2];

  // Initialize canvases
  for (var i = 0; i < 4; i++) {
    canvas[i].width = canvasSize[0]; 
    canvas[i].height = canvasSize[1];
  }

  // Initialize shader sandboxes
  for (var i = 0; i < 4; i++) {
    sandbox[i] = new GlslCanvas(canvas[i]); 
  }
  
  noCanvas();

  for (var i = 0; i < 4; i++) {
    sandbox[i].setUniform("u_seed", Math.random());
  }

  // startRecording();
}

// ------------------------------- Sketch Draw (loop) ------------------------
function draw() {
  for (var i = 0; i < 4; i++) {
    sandbox[i].setUniform("u_position", canvas[i].width/2, canvas[i].height/2);
  }
}

function windowResized() {
    // New resize logic. 
  // var canvas = document.getElementById("glslCanvas");
  // canvasSize = [windowWidth, windowHeight];

  // // Set the starting position. 
  // currentPosition.set(canvasSize[0]/2, canvasSize[1]/2); 

  // // Resize canvas. 
  // canvas.width = canvasSize[0]; canvas.height = canvasSize[1]; 
}

function startRecording() { 
  stream = canvas.captureStream(30);
  // Start recording. 
  try {
    mediaRecorder = new MediaRecorder(stream, options);
  } catch (e0) {
    console.log('Unable to create MediaRecorder with options Object: ', e0);
    try {
      options = {mimeType: 'video/webm; codecs=vp9'};
      mediaRecorder = new MediaRecorder(stream, options);
    } catch (e1) {
      console.log('Unable to create MediaRecorder with options Object: ', e1);
      try {
        options = 'video/webm; codecs=vp9'; // Chrome 47
        mediaRecorder = new MediaRecorder(stream, options);
      } catch (e2) {
        alert('MediaRecorder is not supported by this browser.\n\n' +
          'Try Firefox 29 or later, or Chrome 47 or later, ' +
          'with Enable experimental Web Platform features enabled from chrome://flags.');
        console.error('Exception while creating MediaRecorder:', e2);
        return;
      }
    }
  }
  
  console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
  // mediaRecorder.onstop = handleStop;
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start(100); // Every blob is worth 1second of data.
  console.log('MediaRecorder started', mediaRecorder);
  // startButton.innerHTML = 'Stop Recording'

  setTimeout(stopRecording, 1*60*1000); // After number of seconds. 
} 

function download() {
  console.log('Download Recording');
  var blob = new Blob(recordedChunks, {
    type: "video/webm"
  });
  var url = URL.createObjectURL(blob);
  console.log(url);
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  a.href = url;
  a.download = Date.now() + '.webm';
  a.click();
  window.URL.revokeObjectURL(url);
}

function handleDataAvailable(event) {
  console.log('data-available'); 
  if (event.data.size > 0) {
    recordedChunks.push(event.data); 
    // console.log(recordedChunks); 
  } else {
    console.log('nothing');
  }
}

function stopRecording() {
  // Stop recording, initiate download
  // Restart recording. 
  mediaRecorder.stop(); 
  console.log('MediaRecorder stopped');

  // Initiate the download.
  download(); 

  // Start recording again. 
  startRecording(); 
}
