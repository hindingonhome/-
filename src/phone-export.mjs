import {isLiteTouchDevice,phoneMessage} from './phone-policy.mjs';
export function presentPhoneDownload(blob,name){
 if(!isLiteTouchDevice())return false;
 let dialog=document.getElementById('phoneFileDialog');if(!dialog){dialog=document.createElement('dialog');dialog.id='phoneFileDialog';dialog.setAttribute('data-user-text','');document.body.appendChild(dialog);}
 if(dialog.open)dialog.close();dialog.replaceChildren();
 const heading=document.createElement('h2');heading.textContent=phoneMessage('title');
 const description=document.createElement('p');description.textContent=phoneMessage('ready');
 const filename=document.createElement('p');filename.className='phone-export-name';filename.textContent=name;
 const actions=document.createElement('div');actions.className='dialog-actions';
 const close=document.createElement('button');close.textContent=phoneMessage('close');close.onclick=()=>dialog.close();
 const download=document.createElement('button');download.textContent=phoneMessage('download');
 download.onclick=()=>{const url=URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=url;anchor.download=name;document.body.appendChild(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);};
 const share=document.createElement('button');share.className='primary';share.textContent=phoneMessage('share');
 const file=new File([blob],name,{type:blob.type==='application/x-metal-lab-project'?'application/octet-stream':blob.type||'application/octet-stream'});
 let canShare=false;try{canShare=!!(navigator.share&&navigator.canShare?.({files:[file]}));}catch{}
 share.hidden=!canShare;
 share.onclick=async()=>{try{await navigator.share({files:[file]});dialog.close();}catch(error){if(error.name!=='AbortError')description.textContent=phoneMessage('failed');}};
 actions.append(close,download,share);dialog.append(heading,description,filename,actions);dialog.showModal();return true;
}
