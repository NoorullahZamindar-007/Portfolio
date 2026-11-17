// Traffic Sign Classifier — in-browser demo (TensorFlow.js).
// Model: Noor-Khan/traffic-sign-classification (Keras CNN, GTSRB, 43 classes).
// Preprocessing matches training exactly: RGB, resize to 50x50, pixels / 255.
"use strict";

const CLASS_NAMES = [
  "Speed limit (20km/h)", "Speed limit (30km/h)", "Speed limit (50km/h)",
  "Speed limit (60km/h)", "Speed limit (70km/h)", "Speed limit (80km/h)",
  "End of speed limit (80km/h)", "Speed limit (100km/h)",
  "Speed limit (120km/h)", "No passing",
  "No passing for vehicles over 3.5 metric tons",
  "Right-of-way at the next intersection", "Priority road", "Yield", "Stop",
  "No vehicles", "Vehicles over 3.5 metric tons prohibited", "No entry",
  "General caution", "Dangerous curve to the left",
  "Dangerous curve to the right", "Double curve", "Bumpy road",
  "Slippery road", "Road narrows on the right", "Road work",
  "Traffic signals", "Pedestrians", "Children crossing",
  "Bicycles crossing", "Beware of ice/snow", "Wild animals crossing",
  "End of all speed and passing limits", "Turn right ahead",
  "Turn left ahead", "Ahead only", "Go straight or right",
  "Go straight or left", "Keep right", "Keep left",
  "Roundabout mandatory", "End of no passing",
  "End of no passing by vehicles over 3.5 metric tons",
];

const MODEL_URL = "./tfjs_model/model.json";
const IMAGE_SIZE = 50;

let model = null;
let currentImage = null; // HTMLImageElement
let currentObjectUrl = null; // blob URL for the current upload, if any
// Increments on every load request: a slow image that finishes after a
// newer one was picked must not overwrite the newer selection. Picking
// file A then quickly file B used to show A if A's decode finished last.
let loadToken = 0;

// Phone photos can be tens of megabytes; decoding one fully just to
// downscale it to 50x50 wastes memory and can stall a mobile browser.
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const statusEl = document.getElementById("status");
const predictBtn = document.getElementById("predict-btn");
const previewWrap = document.getElementById("preview-wrap");
const previewImg = document.getElementById("preview");
const resultsCard = document.getElementById("results");
const resultsBody = document.getElementById("results-body");
const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("file-input");

function setStatus(text) { statusEl.textContent = text; }

async function loadModel() {
  try {
    model = await tf.loadLayersModel(MODEL_URL);
    predictBtn.disabled = !currentImage;
    predictBtn.textContent = "Classify this sign";
    setStatus("Model ready. Upload a photo or try a sample.");
  } catch (err) {
    console.error(err);
    setStatus("Could not load the model. Check your connection and reload the page.");
    predictBtn.textContent = "Model failed to load";
  }
}

function showImage(img, label) {
  currentImage = img;
  previewImg.src = img.src;
  previewWrap.style.display = "block";
  resultsCard.style.display = "none";
  if (model) {
    predictBtn.disabled = false;
    predictBtn.textContent = "Classify this sign";
  }
  setStatus(label || "Photo ready — tap “Classify this sign”.");
}

function loadFromFile(file) {
  if (!file || !file.type.startsWith("image/")) {
    setStatus("Please choose an image file.");
    return;
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    setStatus("That photo is too large (" + (file.size / 1024 / 1024).toFixed(1) + " MB). Please choose one under 10 MB.");
    return;
  }
  // Free the previous upload's blob URL: createObjectURL holds the file
  // in memory until revoked, so every upload used to leak one.
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
  const token = ++loadToken;
  const img = new Image();
  img.onload = () => {
    if (token !== loadToken) return; // a newer image was picked meanwhile
    showImage(img, "Photo ready — tap “Classify this sign”.");
  };
  img.onerror = () => {
    if (token !== loadToken) return;
    if (currentObjectUrl) {
      URL.revokeObjectURL(currentObjectUrl);
      currentObjectUrl = null;
    }
    setStatus("Could not read that image. Try another file.");
  };
  currentObjectUrl = URL.createObjectURL(file);
  img.src = currentObjectUrl;
}

function loadFromUrl(url, label) {
  // A sample replaces the uploaded photo, so free its blob URL now
  // instead of leaving it in memory until the next upload.
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
  const token = ++loadToken;
  const img = new Image();
  img.onload = () => {
    if (token !== loadToken) return; // a newer sample was picked meanwhile
    showImage(img, label || "Sample loaded — tap “Classify this sign”.");
  };
  img.onerror = () => {
    if (token !== loadToken) return;
    setStatus("Could not load the sample image. Try uploading your own.");
  };
  img.src = url;
}

function predict() {
  if (!model || !currentImage) return;
  predictBtn.disabled = true;
  predictBtn.textContent = "Classifying…";
  setStatus("Running inference in your browser…");
  // Defer so the UI updates before the (fast) synchronous-ish predict.
  setTimeout(() => {
    try {
      const probs = tf.tidy(() => {
        const tensor = tf.browser.fromPixels(currentImage)
          .resizeBilinear([IMAGE_SIZE, IMAGE_SIZE])
          .toFloat()
          .div(255.0)
          .expandDims(0);
        return model.predict(tensor).dataSync();
      });
      const top3 = Array.from(probs)
        .map((p, i) => ({ name: CLASS_NAMES[i], prob: p }))
        .sort((a, b) => b.prob - a.prob)
        .slice(0, 3);
      resultsBody.innerHTML = top3.map((r, idx) => {
        const pct = (r.prob * 100).toFixed(1);
        return '<div class="row' + (idx === 0 ? " top" : "") + '">' +
          '<div class="label"><span>' + (idx + 1) + ". " + r.name + "</span><span>" + pct + "%</span></div>" +
          '<div class="bar"><div style="width:' + Math.max(pct, 1) + '%"></div></div>' +
          "</div>";
      }).join("");
      resultsCard.style.display = "block";
      setStatus("Done — top prediction: " + top3[0].name + " (" + (top3[0].prob * 100).toFixed(1) + "%).");
    } catch (err) {
      console.error(err);
      setStatus("Something went wrong running the model. Try another image.");
    } finally {
      predictBtn.disabled = false;
      predictBtn.textContent = "Classify this sign";
    }
  }, 30);
}

dropzone.addEventListener("click", () => fileInput.click());
// The dropzone is a focusable button now: Enter/Space must open the
// file picker too, or keyboard users cannot upload at all.
dropzone.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    fileInput.click();
  }
});
fileInput.addEventListener("change", (e) => {
  loadFromFile(e.target.files[0]);
  // Reset so picking the same file again still fires a change event.
  e.target.value = "";
});
dropzone.addEventListener("dragover", (e) => { e.preventDefault(); dropzone.classList.add("dragover"); });
dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropzone.classList.remove("dragover");
  loadFromFile(e.dataTransfer.files[0]);
});
document.querySelectorAll(".samples figure").forEach((fig) => {
  const selectSample = () => {
    document.querySelectorAll(".samples figure").forEach((f) => f.classList.remove("selected"));
    fig.classList.add("selected");
    loadFromUrl(fig.dataset.sample, "Sample loaded — tap “Classify this sign”.");
  };
  fig.addEventListener("click", selectSample);
  // Sample figures are focusable buttons: Enter/Space must select them
  // too, or keyboard users cannot try a sample at all.
  fig.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectSample();
    }
  });
});
predictBtn.addEventListener("click", predict);

loadModel();
