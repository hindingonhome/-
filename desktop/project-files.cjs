const path=require('node:path');
function isProjectPath(file){return typeof file==='string'&&path.isAbsolute(file)&&path.extname(file).toLowerCase()==='.mlab';}
function addRecent(current,file){if(!isProjectPath(file))throw Error('工程文件后缀必须为 .mlab');return [file,...(Array.isArray(current)?current:[]).filter(item=>isProjectPath(item)&&path.normalize(item).toLowerCase()!==path.normalize(file).toLowerCase())].slice(0,8);}
async function nextAvailableProjectPath(file,exists){if(!isProjectPath(file))throw Error('工程文件后缀必须为 .mlab');const dir=path.dirname(file),stem=path.basename(file,'.mlab').replace(/_\d{3,}$/,'');for(let number=1;number<=9999;number++){const candidate=path.join(dir,`${stem}_${String(number).padStart(3,'0')}.mlab`);if(!await exists(candidate))return candidate;}throw Error('可用工程文件名已用尽');}
module.exports={isProjectPath,addRecent,nextAvailableProjectPath};
