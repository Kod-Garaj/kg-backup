import { contextBridge, ipcRenderer } from "electron";

// Expose ipcRenderer to the client
contextBridge.exposeInMainWorld("ipcRenderer", {
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
    // let validChannels = ['nameOfClientChannel'] // <-- Array of all ipcRenderer Channels used in the client
    // if (validChannels.includes(channel)) {
    //   ipcRenderer.send(channel, data)
    // }
  },
  receive: (channel, func) => {
    ipcRenderer.on(channel, func);
    // let validChannels = ['nameOfElectronChannel'] // <-- Array of all ipcMain Channels used in the electron
    // if (validChannels.includes(channel)) {
    //   // Deliberately strip event as it includes `sender`
    //   ipcRenderer.on(channel, (event, ...args) => func(...args))
    // }
  },
});

// Set up context bridge between the renderer process and the main process
// contextBridge.exposeInMainWorld(
//   'shell',
//   {
//     open: () => ipcRenderer.send('shell:open'),
//   }
// )
