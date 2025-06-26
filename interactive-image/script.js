// Get references to DOM elements
const image = document.getElementById("mainImage");
const dropdown = document.getElementById("imageSelector");
const rotationSlider = document.getElementById("rotationInput");
const rotationBox = document.getElementById("rotationValue");

// Update image when dropdown changes
dropdown.addEventListener("change", function () {
  image.src = dropdown.value;
});

// Rotate image when slider changes
rotationSlider.addEventListener("input", () => {
  const angle = rotationSlider.value;
  image.style.transform = `rotate(${angle}deg)`;
  rotationBox.value = angle;
});

// Rotate image when number input changes
rotationBox.addEventListener("input", () => {
  let angle = parseInt(rotationBox.value) || 0;
  angle = Math.max(0, Math.min(angle, 360)); // clamp
  rotationSlider.value = angle;
  image.style.transform = `rotate(${angle}deg)`;
});
