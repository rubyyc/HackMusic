const { ipcRenderer } = require('electron')
const { $, convertDuration } = require('./helper')

let musicAudio = new Audio()
// musicAudio.loop = true
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
  console.log(allTracks)
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
                <div class="col-6 font-weight-bold  text-truncate">
                  正在播放: ${name}
                </div>
                <div class="col-3">
                  <span id="current-seeker">00:00</span> / ${convertDuration(duration)}
                </div>
                <div class="col-3">
                  <i class="fas fa-align-justify ml-4"></i>
                  <i class="fas fa-step-backward ml-4"></i>
                  <i class="fas fa-pause ml-4" id="play-icon"></i>
                  <i class="fas fa-step-forward ml-4"></i>
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
  if (seeker) {
    seeker.innerHTML = convertDuration(currentTime)
  }

  if ( !musicAudio.loop && musicAudio.ended) {
    const currentIndex = allTracks.indexOf(currentTrack)
    index = (currentIndex + 1)  % (allTracks.length)
    currentTrack =  allTracks[index]
    musicAudio.src = currentTrack.path
    musicAudio.play()
  }
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
    if ($('play-icon')) {
      $('play-icon').classList.replace('fa-play', 'fa-pause')
    }
  } else if (id && classList.contains('fa-pause')) {
    // 暂停
    musicAudio.pause()
    // 替换播放图标
    classList.replace('fa-pause','fa-play')
    $('play-icon').classList.replace('fa-pause','fa-play')
  } else if (id && classList.contains('fa-trash-alt')) {
    // 删除音乐
    $('player-status').innerHTML = ''
    if(currentTrack && currentTrack.id === id) {
      musicAudio.pause()
      currentTrack = ''
    }
    ipcRenderer.send('delete-track', id)
  }
})


// 播放器-控制
$('player-status').addEventListener('click', (event) => {
  // console.log(99999)
  event.preventDefault()
  const { classList } = event.target
  const currentIndex = allTracks.indexOf(currentTrack)
  let index = 0
  
  if (classList.contains('fa-step-backward')) {
    // 上一曲
    replaceIcon(0)
    let preIndex = currentIndex - 1
    index = preIndex > 0 ? preIndex : preIndex + allTracks.length
    currentTrack =  allTracks[index]
    musicAudio.src = currentTrack.path
    musicAudio.play()
    replaceIcon(1)
  } else if (classList.contains('fa-step-forward')) {
    // 下一曲
    replaceIcon(0)
    index = (currentIndex + 1)  % (allTracks.length)
    currentTrack =  allTracks[index]
    musicAudio.src = currentTrack.path
    musicAudio.play()
    replaceIcon(1)
  } else if (classList.contains('fa-pause')){
    // 暂停
    musicAudio.pause()
    classList.replace('fa-pause','fa-play')
    replaceIcon(0)
  } else if (classList.contains('fa-play')){
    // 播放
    musicAudio.play()
    classList.replace('fa-play', 'fa-pause')
    replaceIcon(1)
  }else if (classList.contains('fa-redo-alt')){
    // 随机播放
    // musicAudio.loop = true
    classList.replace('fa-redo-alt', 'fa-random')
  }
  else if (classList.contains('fa-random')){
    // 顺序播放
    musicAudio.loop =  false
    classList.replace('fa-random', 'fa-align-justify')
  }else if (classList.contains('fa-align-justify')){
    // 循环播放
    musicAudio.loop = true
    classList.replace('fa-align-justify','fa-redo-alt')
  }
})

const replaceIcon = (flag) => {
  var currentli = document.querySelector(`[data-id="${currentTrack.id}"]`)
  if (flag) {
    currentli.classList.replace('fa-play','fa-pause')
  } else {
    currentli.classList.replace('fa-pause','fa-play')
  }
  
}

//接收快捷键
ipcRenderer.on('pause',(event) => {
  if (currentTrack) {
    $('play-icon').click()
  }
})