const { ipcRenderer } = require('electron')
const { $, convertDuration } = require('./helper')

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
  if ( currentTrack ){
    var currentli = document.querySelector(`[data-id="${currentTrack.id}"]`)
    console.log(`通过document.querySelector([data-id="${currentTrack.id}"]获取li`, currentli)
    currentli.classList.replace('fa-play','fa-pause')
  }
})

// 渲染播放器的html
const renderPlayerHTML = (name, duration) => {
  const player = $('player-status')
  const html = `
                <div class="col font-weight-bold">
                  正在播放: ${name}
                </div>
                <div class="col">
                  <span id="current-seeker">00:00</span> / ${convertDuration(duration)}
                </div>
                `
  player.innerHTML = html

}

musicAudio.addEventListener('loadedmetadata', () => {
  // 渲染播放器
  renderPlayerHTML(currentTrack.fileName, musicAudio.duration)
  // 更新播放器状态
  updateProgressHTML(musicAudio.currentTime, musicAudio.duration)
})

// 更新播放时间
const updateProgressHTML = (currentTime, duration) => {
  // 计算 progress
  const progress =  Math.floor(currentTime / duration * 100)
  const bar = $('player-progress')
  bar.innerHTML = progress + "%"
  bar.style.width = progress + "%"
  const seeker = $('current-seeker')
  seeker.innerHTML = convertDuration(currentTime)
}

musicAudio.addEventListener('timeupdate', () => {
  // 更新播放器状态
  updateProgressHTML(musicAudio.currentTime, musicAudio.duration)
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
    if(currentTrack && currentTrack.id === id) {
      // 继续播放当前歌曲
      musicAudio.play()
    } else{
      // 播放新的歌曲
      currentTrack = allTracks.find(track => track.id === id)
      musicAudio.src = currentTrack.path
      musicAudio.play()
      
      // 还原之前的图标
      const resetIconEle = document.querySelector('.fa-pause')
      if (resetIconEle) {
        resetIconEle.classList.replace('fa-pause','fa-play')
      }
    }
    // 替换播放图标
    classList.replace('fa-play', 'fa-pause')
  } else if (id && classList.contains('fa-pause')) {
    // 暂停
    musicAudio.pause()
    // 替换播放图标
    classList.replace('fa-pause','fa-play')
  } else if (id && classList.contains('fa-trash-alt')) {
    // 删除音乐
    if(currentTrack && currentTrack.id === id) {
      musicAudio.pause()
      currentTrack = ''
    }
    ipcRenderer.send('delete-track', id)
  }
})