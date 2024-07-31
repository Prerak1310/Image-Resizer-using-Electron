//importing required objects from electron pacakge
const { create } = require("domain");
const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
//library to perform image resizing
const resizeImg = require("resize-img");
const os = require("os");
const fs = require("fs");
// importing path module to use in loadFile
const path = require("path");
process.env.NODE_ENV = "production";
// stores to boolean to see if our app is in development mode or not
const isDev = process.env.NODE_ENV !== "production";

let mainWindow;

//function to create our main window
function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "Image Resizer",
    width: isDev ? 1000 : 500, //if in development then width 1000
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  //opening devtools if in development mode
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  //loading a file into our window
  mainWindow.loadFile(path.join(__dirname, "./renderer/index.html"));
}

// creating a about window
function createAboutWindow() {
  const aboutWindow = new BrowserWindow({
    title: "About Image Resizer",
    width: 300,
    height: 300,
  });

  aboutWindow.loadFile(path.join(__dirname, "./renderer/about.html"));
}

// good practice method to call createMainWindow Function
app.whenReady().then(() => {
  createMainWindow();
  // creating main menu
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);
  // Remove main window from memory on close
  mainWindow.on("closed", () => (mainWindow = null));
  //creating a new window just incase no window is opened.
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows.length === 0) {
      createMainWindow();
    }
  });
});
// this is kill the app's process once all windows are closed.In mac processes arent killed
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// menu template
const menu = [
  {
    role: "fileMenu",
  },
  {
    label: "Help",
    submenu: [
      {
        label: "About",
        click: createAboutWindow,
      },
    ],
  },
];
//***********************************************************************************
// Respond to ipcRenderer resize
ipcMain.on("image:resize", (e, options) => {
  options.dest = path.join(os.homedir(), "imageresizer");
  resizeImage(options);
});

// function to resize image
async function resizeImage({ imgPath, width, height, dest }) {
  try {
    const newPath = await resizeImg(fs.readFileSync(imgPath), {
      width: +width,
      height: +height, // the plus sign is to convert the width and height from string to number
    });
    // create filename
    const filename = path.basename(imgPath);

    //create destination folder if doesnt exist
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }
    //write file to destination
    fs.writeFileSync(path.join(dest, filename), newPath);
    //send success
    mainWindow.webContents.send("image:done");
    //open destination folder
    shell.openPath(dest);
  } catch (error) {
    console.log(error);
  }
}

// method 1 of calling createMainWindow function
// app.on("ready", () => {
//   createMainWindow();
// });
