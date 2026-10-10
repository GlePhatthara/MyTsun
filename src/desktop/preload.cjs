const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('tsunAPI', {
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),
  testConnection: (config) => ipcRenderer.invoke('settings:test-connection', config),
  getState: () => ipcRenderer.invoke('state:get'),
  resetState: () => ipcRenderer.invoke('state:reset'),
  sendChat: (message) => ipcRenderer.invoke('chat:send', message)
});
