// Get elements
const image = document.getElementById("mainImage");
const dropdown = document.getElementById("imageSelector");
const rotationSlider = document.getElementById("rotationInput");
const rotationBox = document.getElementById("rotationValue");

// Dropdown changes image
dropdown.addEventListener("change", function () {
  image.src = dropdown.value;
});

// Slider → Number box + rotate image
rotationSlider.addEventListener("input", () => {
  const angle = rotationSlider.value;
  image.style.transform = `rotate(${angle}deg)`;
  rotationBox.value = angle;
});

// Number box → Slider + rotate image
rotationBox.addEventListener("input", () => {
  let angle = parseInt(rotationBox.value) || 0;
  angle = Math.max(0, Math.min(angle, 360)); // Clamp
  rotationSlider.value = angle;
  image.style.transform = `rotate(${angle}deg)`;
});
