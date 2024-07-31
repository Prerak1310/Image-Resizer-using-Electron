const form = document.querySelector("#img-form");
const img = document.querySelector("#img");
const outputPath = document.querySelector("#output-path");
const filename = document.querySelector("#filename");
const heightInput = document.querySelector("#height");
const widthInput = document.querySelector("#width");

function loadImage(e) {
  const file = e.target.files[0];

  // return out of function if image is not of valid type
  if (!isFileImage(file)) {
    errorAlert("Please select an image!");
    return;
  }
  console.log("success");

  // get original dimensions
  // ****************************************************************
  const image = new Image();
  image.src = URL.createObjectURL(file);
  image.onload = function () {
    widthInput.value = this.width;
    heightInput.value = this.height;
  };
  // sets the display style value for the form to block when image is selected
  form.style.display = "block";

  //getting the filename
  filename.innerText = file.name;

  // setting the output path after selecting and resizing file
  outputPath.innerText = path.join(os.homedir(), "imageresizer");
}

// send image data to main process
function sendImage(e) {
  e.preventDefault(); //***********************************************************
  //checking if image is there
  if (!img.files[0]) {
    errorAlert("Please upload an image");
    return;
  }

  //if the height and width inputs are filled in
  const width = widthInput.value;
  const height = heightInput.value;
  const imgPath = img.files[0].path;
  if (width === "" || height === "") {
    errorAlert("Please fill in a height and width!");
    return;
  }

  // send to main using ipc renderer
  ipcRenderer.send("image:resize", { imgPath, width, height });
}

// catch the image:done event
ipcRenderer.on("image:done", () => {
  errorAlert(`Image resized!! ${widthInput.value} X ${heightInput.value}`);
});

// Make sure file is image
function isFileImage(file) {
  const acceptedImageTypes = ["image/png", "image/gif", "image/jpeg"];
  return file && acceptedImageTypes.includes(file["type"]);
}

//error function with toastify
function errorAlert(message) {
  Toastify.toast({
    text: message,
    duration: 5000, //in ms
    close: false,
    style: {
      background: "red",
      color: "white",
      textAlign: "center",
    },
  });
}

img.addEventListener("change", loadImage);
form.addEventListener("submit", sendImage);
