const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('tsunAPI', {
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),
  testConnection: (config) => ipcRenderer.invoke('settings:test-connection', config),
  listModels: (config) => ipcRenderer.invoke('settings:list-models', config),
  getState: () => ipcRenderer.invoke('state:get'),
  resetState: () => ipcRenderer.invoke('state:reset'),
  sendChat: (message) => ipcRenderer.invoke('chat:send', message),
  detectAuth: () => ipcRenderer.invoke('auth:detect'),
  getAuth: () => ipcRenderer.invoke('auth:get'),
  setAuth: (data) => ipcRenderer.invoke('auth:set', data),
  logoutAuth: (provider) => ipcRenderer.invoke('auth:logout', provider)
});
