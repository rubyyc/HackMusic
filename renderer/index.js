const { ipcRenderer } = require('electron')
const { $ } = require('./helper')

let musicAudio = new Audio()
let allTracks
let currentTrack

$('add-music-button').addEventListener('click', () => {
  ipcRenderer.send('add-music-window')
})


const renderListHTML = (tracks) => {
  const tracksList = $('tracksList')
  const tracksListHTML = tracks.reduce((html, track) => {
    html += `<li class="row music-track list-group-item d-flex justify-content-between align-items-center">
      <div class="col-10">
        <i class="fas fa-music mr-2 text-secondary"></i>
        <b>${track.fileName}</b>
      </div>
      <div class="col-2">
        <i class="fas fa-play mr-3" data-id="${track.id}"></i>
        <i class="fas fa-trash-alt" data-id="${track.id}"></i>
      </div>
    </li>`
    return html
  }, '')
  const emptyTrackHTML = '<div class="alert alter-primary">还没有添加音乐</div>'
  tracksList.innerHTML = tracks.length ? `<ul class="list-group">${tracksListHTML}</ul>` : emptyTrackHTML
}

// 接收数据渲染主页面
ipcRenderer.on('getTracks' , (event, tracks) => {
  console.log('mainWindow接收到数据')
  allTracks = tracks
  // 渲染主页面列表
  renderListHTML(tracks)
})

// 点击播放
$('tracksList').addEventListener('click', (event) =>{
  event.preventDefault()
  console.log('event.target:', event.target)
  const { dataset, classList} = event.target
  const id = dataset && dataset.id

  // classList
  if (id && classList.contains('fa-play')){
    // 播放音乐
    currentTrack = allTracks.find(track => track.id === id)
    musicAudio.src = currentTrack.path
    musicAudio.play()
    // 替换播放图标
    classList.replace('fa-play', 'fa-pause')
  }
})