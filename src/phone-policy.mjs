export function isLiteTouchDevice(env=globalThis){return !!(env.document?.body?.classList.contains('metallab-web')&&env.matchMedia?.('(pointer:coarse) and (max-width:1024px)').matches);}
export function phoneFileLimit(kind){return ['stl','obj'].includes(kind)?128*1024*1024:32*1024*1024;}
const copy={
 limit:['手机版文件过大，请在电脑版处理或先简化模型。STL/OBJ 上限128 MB，其他模型和工程上限32 MB。','手機版檔案過大，請在電腦版處理或先簡化模型。STL/OBJ 上限128 MB，其他模型與專案上限32 MB。','This file is too large for the phone. Use the desktop version or simplify it first. STL/OBJ: 128 MB; other models and projects: 32 MB.'],
 workspace:['手机工作区预览超过128 MiB，请保存工程并新建工作区。','手機工作區預覽超過128 MiB，請儲存專案並新建工作區。','Phone preview data exceeds 128 MiB. Save your project and start a new workspace.'],
 ready:['文件已准备好，请选择分享或下载并保存到“文件”。','檔案已準備好，請分享或下載並儲存至「檔案」。','Your file is ready. Share or download it and save it to Files.'],
 title:['保存文件','儲存檔案','Save file'],share:['分享 / 存储到文件','分享 / 儲存至檔案','Share / Save to Files'],download:['下载文件','下載檔案','Download file'],close:['关闭','關閉','Close'],failed:['无法分享，请使用下载按钮。','無法分享，請使用下載按鈕。','Sharing is unavailable. Use Download instead.']
};
export function phoneMessage(key,env=globalThis){const lang=env.document?.documentElement?.lang;return copy[key]?.[lang==='en'?2:lang==='zh-TW'?1:0]??key;}
export function assertPhoneFileSize(file,kind,env=globalThis){if(isLiteTouchDevice(env)&&file.size>phoneFileLimit(kind))throw Error(phoneMessage('limit',env));}
