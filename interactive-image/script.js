// Get DOM elements
const image = document.getElementById("mainImage");
const dropdown = document.getElementById("imageSelector");
const rotationSlider = document.getElementById("rotationInput");
const rotationBox = document.getElementById("rotationValue");

// Unified rotation function
function updateRotation(angle) {
  angle = parseInt(angle) || 0;
  angle = Math.max(0, Math.min(angle, 360)); // Clamp to valid range
  image.style.transform = `rotate(${angle}deg)`;
  rotationSlider.value = angle;
  rotationBox.value = angle;
}

// Dropdown changes image
dropdown.addEventListener("change", () => {
  image.src = dropdown.value;
});

// Sync slider → update
rotationSlider.addEventListener("input", () => {
  updateRotation(rotationSlider.value);
});

// Sync number box → update
rotationBox.addEventListener("input", () => {
  updateRotation(rotationBox.value);
});
