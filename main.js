const {app, BrowserWindow, ipcMain, dialog, globalShortcut  } = require('electron')
const DataStore = require('./renderer/MusicDataStore')

// 创建数据文件名称
const MyStore = new DataStore({'name' : 'Music-Data'})

// const Store = require('electron-store')
// const store = new Store()
// console.log('userData', app.getPath('userData'))

class AppWindow extends BrowserWindow {
  constructor(config, fileLocation) {
    const basicConfig = {
      width: 800,
      height: 600,
      show: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    }
    // 合并两个object
    // 第一种方法
    // const finalConfig = Object.assign(basicConfig, config)
    // 第二种方法
    const finalConfig = { ...basicConfig, ...config}
    super(finalConfig)
    this.loadFile(fileLocation)
    this.once('ready-to-show', () => {
      this.show()
    })
  }
}

app.on('ready', () => {
  console.log("electron已完全加载.准备创建window...")
  const ret = globalShortcut.register('Alt+z', () => {
    mainWindow.send('pause')
  })


  const mainWindow = new AppWindow({
    width: 1459,
    height: 757,
    resizable: false
  }, './renderer/index.html')

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('did-finish-load')
    mainWindow.send('getTracks', MyStore.getTracks())
  })
  // mainWindow.loadFile('./renderer/index.html')

  ipcMain.on('message', (event, arg) => {
    console.log(arg)
    //event.sender.send('reply', 'hello from main')
    mainWindow.send('reply', 'hello from mainWindow')
  })

  ipcMain.on('add-music-window', (event, arg) => {
    const addWindow = new AppWindow({
      width: 500,
      height: 400,
      parent: mainWindow
    }, './renderer/add.html')
  })

  ipcMain.on('open-music-file', (event) => {
    console.log('open-music-file')
    dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'Music', extensions: ['mp3','flac']}]
    }).then( result => {
      console.log(result.filePaths)
      if (result.filePaths) {
        event.sender.send('selected-file', result.filePaths)
      }
    })
  })

  ipcMain.on('add-tracks', (event, tracks) => {
    console.log('Main 接收 tracks', tracks)
    const updatedTracks = MyStore.addTracks(tracks).getTracks()
    console.log('updated tracks', updatedTracks)
    // 往主窗口传递数据
    mainWindow.send('getTracks', updatedTracks)
  })

  // 删除音乐
  ipcMain.on('delete-track', (event, id) => {
    const updatedTracks = MyStore.deleteTrack(id).getTracks()
    mainWindow.send('getTracks', updatedTracks)
  })
})

/*
// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const path = require('path')

function createWindow () {  
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
*/