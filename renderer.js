const { ipcRenderer } = require('electron')


window.addEventListener('DOMContentLoaded', () => {
  ipcRenderer.send('message', 'hello from renderer')
  ipcRenderer.on('reply', (event, arg) => {
    document.getElementById('message').innerHTML = arg
  })
})

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

/* 测试node api && DOM api
alert(process.versions.node)

window.addEventListener('DOMContentLoaded',() => {
  alert('greeting from the DOM side')
})
*/

