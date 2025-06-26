// Get references to the DOM elements
const image = document.getElementById("mainImage");
const dropdown = document.getElementById("imageSelector");
const captionInput = document.getElementById("captionInput");
const captionText = document.getElementById("captionText");

// When the dropdown changes, update the image src
dropdown.addEventListener("change", function () {
  image.src = dropdown.value;
});

// When the text input changes, update the caption live
captionInput.addEventListener("input", function () {
  captionText.textContent = captionInput.value;
});
