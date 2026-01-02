// Array for shader sandboxes and canvases.
var sandbox = [];
var canvas = [];

var stream;
var recordedChunks = [];
var mediaRecorder;
var options = { mimeType: "video/webm; codecs=vp9" };
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
  let canvasSize = [windowWidth / 2, windowHeight / 2];

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
    sandbox[i].setUniform(
      "u_position",
      canvas[i].width / 2,
      canvas[i].height / 2,
    );
  }
}

function mousePressed() {
  console.log("Mouse Pressed");

  // Force a render update before capturing
  sandbox[0].forceRender = true;

  // Wait for next frame to ensure render is complete
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // Get the WebGL context
      const gl =
        canvas[0].getContext("webgl") ||
        canvas[0].getContext("experimental-webgl");

      // Read pixels from WebGL context
      const width = canvas[0].width;
      const height = canvas[0].height;
      const pixels = new Uint8Array(width * height * 4);
      gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

      // Create a temporary canvas to flip the image (WebGL renders upside down)
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = width;
      tempCanvas.height = height;
      const ctx = tempCanvas.getContext("2d");

      // Create ImageData and flip vertically
      const imageData = ctx.createImageData(width, height);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const flippedY = height - y - 1;
          for (let c = 0; c < 4; c++) {
            imageData.data[(y * width + x) * 4 + c] =
              pixels[(flippedY * width + x) * 4 + c];
          }
        }
      }
      ctx.putImageData(imageData, 0, 0);

      // Convert to blob and download
      tempCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = Date.now() + ".png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, "image/png");
    });
  });
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
    console.log("Unable to create MediaRecorder with options Object: ", e0);
    try {
      options = { mimeType: "video/webm; codecs=vp9" };
      mediaRecorder = new MediaRecorder(stream, options);
    } catch (e1) {
      console.log("Unable to create MediaRecorder with options Object: ", e1);
      try {
        options = "video/webm; codecs=vp9"; // Chrome 47
        mediaRecorder = new MediaRecorder(stream, options);
      } catch (e2) {
        alert(
          "MediaRecorder is not supported by this browser.\n\n" +
            "Try Firefox 29 or later, or Chrome 47 or later, " +
            "with Enable experimental Web Platform features enabled from chrome://flags.",
        );
        console.error("Exception while creating MediaRecorder:", e2);
        return;
      }
    }
  }

  console.log("Created MediaRecorder", mediaRecorder, "with options", options);
  // mediaRecorder.onstop = handleStop;
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start(100); // Every blob is worth 1second of data.
  console.log("MediaRecorder started", mediaRecorder);
  // startButton.innerHTML = 'Stop Recording'

  setTimeout(stopRecording, 1 * 60 * 1000); // After number of seconds.
}

function download() {
  console.log("Download Recording");
  var blob = new Blob(recordedChunks, {
    type: "video/webm",
  });
  var url = URL.createObjectURL(blob);
  console.log(url);
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  a.href = url;
  a.download = Date.now() + ".webm";
  a.click();
  window.URL.revokeObjectURL(url);
}

function handleDataAvailable(event) {
  console.log("data-available");
  if (event.data.size > 0) {
    recordedChunks.push(event.data);
    // console.log(recordedChunks);
  } else {
    console.log("nothing");
  }
}

function stopRecording() {
  // Stop recording, initiate download
  // Restart recording.
  mediaRecorder.stop();
  console.log("MediaRecorder stopped");

  // Initiate the download.
  download();

  // Start recording again.
  startRecording();
}
