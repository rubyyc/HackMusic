const { ipcRenderer } =  require('electron')
const { $ } = require('./helper')
const path = require('path')

$('select-music').addEventListener('click', () => {
  ipcRenderer.send('open-music-file')
})

// 渲染添加的音乐列表
const renderListHTML = (pathes) => {
  console.log('2')
  const musicList = $('musicList')
  const musicItemsHTML = pathes.reduce((html, music) => {
    html += `<li class="list-group-item">${path.basename(music)}</li>`
    return html
  }, '')
  console.log('3')
  musicList.innerHTML = `<ul class="list-group">${musicItemsHTML}</ul>`
  console.log('4')
}

let musicFilesPath = []

ipcRenderer.on('selected-file', (event, path) => {
  if (Array.isArray(path)) {
    musicFilesPath = path
    console.log(musicFilesPath)
    console.log('1')
    renderListHTML(musicFilesPath)
  }
})