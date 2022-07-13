"use strict";

import { dialog, app, protocol, BrowserWindow, ipcMain, shell } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
import path from "path";
import fs from "fs";
import { APP_PROTOCOL } from "./config";

const isDevelopment = process.env.NODE_ENV !== "production";

let mainWindow, deeplinkingUrl;

protocol.registerSchemesAsPrivileged([
  { scheme: APP_PROTOCOL, privileges: { secure: true, standard: true } },
]);

// if (process.defaultApp) {
//   if (process.argv.length >= 2) {
//     app.setAsDefaultProtocolClient(APP_PROTOCOL, process.execPath, [
//       path.resolve(process.argv[1]),
//     ]);
//   }
// } else {
//   app.setAsDefaultProtocolClient(APP_PROTOCOL);
// }

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine /*, workingDirectory */) => {
    if (process.platform == "win32") {
      deeplinkingUrl = commandLine.find((arg) =>
        arg.startsWith(APP_PROTOCOL + "://")
      );
    }
    const url = new URL(deeplinkingUrl);
    const obj = JSON.parse(url.searchParams.get("obj"));
    console.log(obj);
    logEverywhere("app.makeSingleInstance# " + deeplinkingUrl);

    mainWindow.webContents.send("shell:open-completed", {
      url: deeplinkingUrl,
      obje: obj,
    });

    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  app.on("open-url", (event, url) => {
    logEverywhere("app.on# " + url);
    dialog.showErrorBox("Welcome Back", `You arrived from: ${url}`);
  });

  app.on("ready", async () => {
    if (isDevelopment && !process.env.IS_TEST) {
      // Install Vue Devtools
      try {
        await installExtension(VUEJS_DEVTOOLS);
      } catch (e) {
        console.error("Vue Devtools failed to install:", e.toString());
      }
    }

    createWindow();

    ipcMain.on("klasor-sec", async (event) => {
      const { filePaths, canceled } = await dialog.showOpenDialog(mainWindow, {
        properties: ["openDirectory"],
      });

      if (!canceled) {
        const recursiveDosyalariTara = (filePath) => {
          const klasorBilgileri = [];
          fs.readdirSync(filePath).forEach((file) => {
            const _filePath = path.join(filePath, file);
            const fileStat = fs.statSync(_filePath);
            const isDir = fileStat.isDirectory();

            const info = {
              isDir,
              fullname: file,
              path: filePath,
              pathWithName: _filePath,
            };

            if (isDir) {
              info.subFiles = recursiveDosyalariTara(_filePath);
            } else {
              const fileArr = file.split(".");
              const fileExt = fileArr[fileArr.length - 1];
              const fileName = fileArr.slice(0, fileArr.length - 1).join(".");
              const size = fileStat.size;

              info.name = fileName;
              info.extension = fileExt;
              info.size = size;
            }

            klasorBilgileri.push(info);
          });

          return klasorBilgileri;
        };

        const klasorBilgileri = recursiveDosyalariTara(filePaths[0]);

        return event.sender.send("klasor-sec:dosyalar", klasorBilgileri);
      }

      event.sender.send("klasor-sec:dosyalar", "Seçim İptal Edildi");
    });

    ipcMain.on("shell:open", (event, info) => {
      console.log("shell:open çalıştı");

      switch (info.type) {
        case "GOOGLE_DRIVE": {
          shell.openExternal("http://localhost:8080/GoogleOAuth");
          break;
        }

        default:
          break;
      }
    });
  });

  if (isDevelopment) {
    if (process.platform === "win32") {
      process.on("message", (data) => {
        if (data === "graceful-exit") {
          app.quit();
        }
      });
    } else {
      process.on("SIGTERM", () => {
        app.quit();
      });
    }
  }
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      enableRemoteModule: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    await mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) mainWindow.webContents.openDevTools();
  } else {
    createProtocol(APP_PROTOCOL);
    mainWindow.loadURL(APP_PROTOCOL + "://./index.html");
  }

  if (process.platform == "win32") {
    deeplinkingUrl = process.argv.slice(1);
  }
  logEverywhere("createWindow# " + deeplinkingUrl);
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("will-finish-launching", function () {
  logEverywhere("app.on# will-finish-launching");
  app.on("open-url", function (event, url) {
    event.preventDefault();
    deeplinkingUrl = url;
    logEverywhere("open-url# " + deeplinkingUrl);
  });
});

function logEverywhere(s) {
  console.log(s);
  if (mainWindow && mainWindow.webContents) {
    // mainWindow.webContents.executeJavaScript(`console.log("${s}")`);
  }
}
