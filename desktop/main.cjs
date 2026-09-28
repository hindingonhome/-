const {app, BrowserWindow, shell, session, protocol, ipcMain, dialog} = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');
const {isProjectPath,addRecent,nextAvailableProjectPath}=require('./project-files.cjs');
if(!app.isPackaged&&process.env.METAL_LAB_TEST_USER_DATA){require('node:fs').mkdirSync(process.env.METAL_LAB_TEST_USER_DATA,{recursive:true});app.setPath('userData',process.env.METAL_LAB_TEST_USER_DATA);}

const htmlPath = path.join(__dirname, '..', 'dist', '金属工坊.html');
const appUrl = 'metal-lab://app/index.html';
const externalHosts = new Set(['sge.com.cn', 'shfe.com.cn']);
let mainWindow;
let currentProjectPath=null;
let pendingProjectPath=process.argv.find(isProjectPath)||null;
const recentFile=()=>path.join(app.getPath('userData'),'recent-projects.json');
async function recentPaths(){try{const rows=JSON.parse(await fs.readFile(recentFile(),'utf8'));if(!Array.isArray(rows))return [];const result=[];for(const file of rows.slice(0,8))if(isProjectPath(file))try{await fs.access(file);result.push(file);}catch{}return result;}catch{return [];}}
async function rememberProject(file){await fs.writeFile(recentFile(),JSON.stringify(addRecent(await recentPaths(),file)),'utf8');}
async function readProjectFile(file){if(!path.isAbsolute(file)||!['.mlab','.json'].includes(path.extname(file).toLowerCase()))throw Error('请选择金属工坊工程文件');const stats=await fs.stat(file);if(stats.size>512*1024*1024)throw Error('工程文件超过 512 MB');const contents=await fs.readFile(file,'utf8');if(isProjectPath(file)){let raw;try{raw=JSON.parse(contents);}catch{throw Error('工程文件内容损坏');}if(raw?.format!=='metal-lab-project'||raw?.formatVersion!==1||!raw?.workspace)throw Error('工程文件格式无效');currentProjectPath=file;await rememberProject(file);}return {path:file,contents};}
async function openProjectDialog(){const result=await dialog.showOpenDialog(mainWindow,{title:'打开金属工坊文件',properties:['openFile'],filters:[{name:'金属工坊工程',extensions:['mlab']},{name:'旧版备份',extensions:['json']}]});return result.canceled?null:readProjectFile(result.filePaths[0]);}
async function sendExternalProject(file){try{const project=await readProjectFile(file);mainWindow.webContents.send('desktop-open-project',project);}catch(error){dialog.showErrorBox('无法打开工程文件',error.message);}}
async function fileExists(file){try{await fs.access(file);return true;}catch{return false;}}
function validateProjectContents(contents){if(typeof contents!=='string'||contents.length>512*1024*1024)throw Error('工程文件过大');let parsed;try{parsed=JSON.parse(contents);}catch{throw Error('工程文件内容无效');}if(parsed?.format!=='metal-lab-project'||parsed?.formatVersion!==1||!parsed?.workspace)throw Error('工程文件格式无效');}
async function chooseProjectPath(saveAs){const base=currentProjectPath??path.join(app.getPath('documents'),'金属工坊工程.mlab');const defaultPath=saveAs||await fileExists(base)?await nextAvailableProjectPath(base,fileExists):base;const result=await dialog.showSaveDialog(mainWindow,{title:saveAs?'另存为金属工坊工程':'保存金属工坊工程',defaultPath,filters:[{name:'金属工坊工程',extensions:['mlab']}]});if(result.canceled||!result.filePath)return null;return /\.mlab$/i.test(result.filePath)?result.filePath:result.filePath+'.mlab';}
async function saveProject(contents,saveAs=false){validateProjectContents(contents);let file=currentProjectPath;if(file&&!saveAs){const answer=await dialog.showMessageBox(mainWindow,{type:'question',title:'保存工程文件',message:`覆盖现有文件「${path.basename(file)}」？`,detail:'也可以另存为新文件，保留当前版本。',buttons:['覆盖保存','另存为…','取消'],defaultId:0,cancelId:2,noLink:true});if(answer.response===2)return null;if(answer.response===1)saveAs=true;}if(!file||saveAs)file=await chooseProjectPath(saveAs);if(!file)return null;if(!isProjectPath(file))throw Error('工程文件后缀必须为 .mlab');if(await fileExists(file)&&(saveAs||file!==currentProjectPath)){const answer=await dialog.showMessageBox(mainWindow,{type:'warning',title:'文件已存在',message:`「${path.basename(file)}」已经存在，确定覆盖吗？`,buttons:['覆盖文件','取消'],defaultId:1,cancelId:1,noLink:true});if(answer.response!==0)return null;}await fs.writeFile(file,contents,'utf8');currentProjectPath=file;await rememberProject(file);return {path:file,name:path.basename(file)};}

protocol.registerSchemesAsPrivileged([{
  scheme: 'metal-lab',
  privileges: {standard: true, secure: true, supportFetchAPI: true}
}]);

function allowedExternal(rawUrl) {
  try {
    const url = new URL(rawUrl);
    return url.protocol === 'https:' && [...externalHosts].some(host => url.hostname === host || url.hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}

function openExternal(rawUrl) {
  if (allowedExternal(rawUrl)) shell.openExternal(rawUrl).catch(console.error);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    title: '金属工坊',
    width: 1360,
    height: 860,
    minWidth: 1040,
    minHeight: 680,
    useContentSize: true,
    center: true,
    show: false,
    backgroundColor: '#24262a',
    autoHideMenuBar: true,
    icon: path.join(__dirname, process.platform === 'win32' ? 'icon.ico' : 'icon.png'),
    webPreferences: {
      preload:path.join(__dirname,'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true
    }
  });
  // Alt is part of viewport navigation; keep the native menu from taking it.
  mainWindow.setMenu(null);

  mainWindow.once('ready-to-show', () => {if(!process.env.METAL_LAB_TEST_USER_DATA)mainWindow.show();});
  mainWindow.webContents.setWindowOpenHandler(({url}) => {
    openExternal(url);
    return {action: 'deny'};
  });
  mainWindow.webContents.on('will-navigate', (event) => {
    if (event.url !== appUrl) {
      event.preventDefault();
      openExternal(event.url);
    }
  });
  mainWindow.loadURL(appUrl);
}

if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', (_event,argv) => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
    const file=argv.find(isProjectPath);if(file){if(mainWindow.webContents.isLoading())mainWindow.webContents.once('did-finish-load',()=>sendExternalProject(file));else sendExternalProject(file);}
  });
  app.whenReady().then(() => {
    app.setAppUserModelId('cn.metallab.desktop');
    ipcMain.handle('desktop-recent-projects',async()=>{const files=await recentPaths();return files.map(file=>({path:file,name:path.basename(file)}));});
    ipcMain.handle('desktop-startup-project',async()=>{const file=pendingProjectPath;pendingProjectPath=null;return file?readProjectFile(file):null;});
    ipcMain.handle('desktop-open-project',()=>openProjectDialog());
    ipcMain.handle('desktop-open-recent',async(_event,file)=>{if(!(await recentPaths()).includes(file))throw Error('最近文件已不可用');return readProjectFile(file);});
    ipcMain.handle('desktop-save-project',(_event,contents)=>saveProject(contents));
    ipcMain.handle('desktop-save-project-as',(_event,contents)=>saveProject(contents,true));
    protocol.handle('metal-lab', async request => {
      const url = new URL(request.url);
      if (url.host !== 'app' || url.pathname !== '/index.html')
        return new Response('Not found', {status: 404});
      const html = await fs.readFile(htmlPath);
      return new Response(html, {headers: {
        'content-type': 'text/html; charset=utf-8',
        'content-security-policy': "default-src 'none'; script-src 'self' 'unsafe-inline' blob:; style-src 'self' 'unsafe-inline'; worker-src blob:; img-src 'self' data: blob:; connect-src 'self' blob:; font-src 'self' data:; base-uri 'none'; object-src 'none'; form-action 'none'"
      }});
    });
    session.defaultSession.on('will-download', (_event, item, contents) => {
      if (mainWindow && contents === mainWindow.webContents)
        item.setSaveDialogOptions({title: '保存金属工坊文件', defaultPath: path.join(app.getPath('downloads'), item.getFilename())});
    });
    createWindow();
  });
  app.on('window-all-closed', () => app.quit());
}
