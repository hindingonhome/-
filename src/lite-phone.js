(function(){
 // The simplified hosted UI exposes manual quotes, not background metal polling.
 try{localStorage.setItem('metal-lab-market-auto','off');}catch{}
 const body=document.body,small=matchMedia('(max-width:760px), (pointer:coarse) and (max-width:1024px)');
 const tabs=document.querySelector('.lite-phone-tabs');let pane='model';
 function showPane(next,scroll=true){pane=next;body.dataset.phonePane=next;tabs.querySelectorAll('[data-phone-pane]').forEach(button=>button.setAttribute('aria-selected',String(button.dataset.phonePane===next)));if(next==='records')document.getElementById('recordsPanel').open=true;if(small.matches&&scroll)window.scrollTo({top:0,behavior:'auto'});}
 tabs.addEventListener('click',e=>{const button=e.target.closest('[data-phone-pane]');if(button){document.activeElement?.blur();showPane(button.dataset.phonePane);}});
 const labels={
  'zh-CN':['模型','估算','记录','单指旋转 · 双指缩放和平移；拖动画布外的区域滚动页面。','手机使用：Safari 打开网址即可。模型和报价在本机处理。保存时选择分享/存储到文件或下载；请定期备份 .mlab，浏览器缓存可能被系统清理。大模型使用轻量预览，体积仍按完整网格计算。'],
  'zh-TW':['模型','估算','記錄','單指旋轉 · 雙指縮放及平移；拖動畫布外的區域捲動頁面。','手機使用：Safari 開啟網址即可。模型與報價在本機處理。儲存時選擇分享/儲存至檔案或下載；請定期備份 .mlab，瀏覽器快取可能被系統清除。大型模型使用輕量預覽，體積仍依完整網格計算。'],
  'en':['Model','Estimate','Records','One finger rotates; two fingers zoom and pan. Scroll outside the canvas.','On iPhone, open the URL in Safari. Models and quotes are processed locally. To save, choose Share / Save to Files or Download. Back up .mlab projects regularly; the system may clear browser storage. Large models use a reduced preview; volume still uses the full mesh.']
 };
 function translate(){const lang=document.documentElement.lang,copy=labels[lang]||labels['zh-CN'];tabs.querySelectorAll('[data-phone-label]').forEach((node,index)=>node.textContent=copy[index]);const fresh=document.querySelector('#newWorkspaceBtn span');fresh.setAttribute('data-user-text','');fresh.textContent=lang==='en'?'New workspace':lang==='zh-TW'?'新建工作區':'新建工作区';document.getElementById('phoneGestureHint').textContent=copy[3];let hint=document.getElementById('phoneGuideHint');if(!hint){hint=document.createElement('p');hint.id='phoneGuideHint';hint.setAttribute('data-user-text','');document.getElementById('helpDialog').appendChild(hint);}hint.textContent=copy[4];}
 document.getElementById('languageSelect').addEventListener('change',()=>setTimeout(translate,0));window.addEventListener('load',translate);
 document.getElementById('manualBtn').addEventListener('click',()=>{if(small.matches)setTimeout(()=>showPane('estimate'),0);});
 document.getElementById('focusVolumeBtn').addEventListener('click',()=>showPane('estimate'));
 document.getElementById('cardList').addEventListener('click',event=>{if(small.matches&&event.target.closest('[data-rename-record],[data-duplicate]'))showPane('estimate',false);},true);
 document.getElementById('addCardBtn').addEventListener('click',()=>{if(small.matches)showPane('estimate',false);},true);
 const mass=document.getElementById('mass');new MutationObserver(()=>{document.getElementById('phoneMass').textContent=mass.textContent==='—'?'':mass.textContent+' g';}).observe(mass,{childList:true,characterData:true,subtree:true});
 document.addEventListener('focusin',event=>{if(small.matches&&event.target.matches('input:not([type=checkbox]):not([type=radio]),textarea'))body.classList.add('phone-keyboard');});
 document.addEventListener('focusout',()=>setTimeout(()=>{if(!document.activeElement.matches('input,textarea'))body.classList.remove('phone-keyboard');},0));
 function visibleHeight(){const viewport=window.visualViewport;body.style.setProperty('--phone-visible-height',(viewport?.height||innerHeight)+'px');body.style.setProperty('--phone-keyboard-offset',Math.max(0,innerHeight-(viewport?.height||innerHeight)-(viewport?.offsetTop||0))+'px');}
 window.visualViewport?.addEventListener('resize',visibleHeight);window.addEventListener('resize',visibleHeight);visibleHeight();
 // iOS Files may not recognize custom extensions in accept filters.
 if(matchMedia('(pointer:coarse)').matches){document.getElementById('fileInput').removeAttribute('accept');document.getElementById('restoreInput').removeAttribute('accept');}
 showPane(pane,false);translate();
 if('serviceWorker' in navigator&&window.isSecureContext&&/^https?:$/.test(location.protocol))navigator.serviceWorker.register('./sw.js').catch(()=>{});
})();
