const { ipcRenderer } = require('electron')
const { $ } = require('./helper')

$('add-music-button').addEventListener('click', () => {
  ipcRenderer.send('add-music-window')
})


const renderListHTML = (tracks) => {
  const tracksList = $('tracksList')
  const tracksListHTML = tracks.reduce((html, track) => {
    html += `<li class="music-track list-group-item d-flex">`
  }, '')
}

ipcRenderer.on('getTracks' , (event, target) => {
  console.log('mainWindow接收到数据')
  // 渲染主页面列表
})