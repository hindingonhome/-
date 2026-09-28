const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('metalLabDesktop',Object.freeze({
 recentProjects:()=>ipcRenderer.invoke('desktop-recent-projects'),
 startupProject:()=>ipcRenderer.invoke('desktop-startup-project'),
 openProject:()=>ipcRenderer.invoke('desktop-open-project'),
 openRecent:file=>ipcRenderer.invoke('desktop-open-recent',file),
 saveProject:contents=>ipcRenderer.invoke('desktop-save-project',contents),
 saveProjectAs:contents=>ipcRenderer.invoke('desktop-save-project-as',contents),
 onOpenProject:callback=>{ipcRenderer.on('desktop-open-project',(_event,project)=>callback(project));}
}));
