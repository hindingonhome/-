import fs from 'node:fs/promises';

export async function applyLiteProfile(html){
 const profile=JSON.parse(await fs.readFile(new URL('./lite-profile.json',import.meta.url),'utf8'));
 const css=await fs.readFile(new URL('../src/lite-light.css',import.meta.url),'utf8');
 const icon=await fs.readFile(new URL('../src/assets/lite-icon.svg',import.meta.url),'utf8');
 // Canvas-drawn orientation surfaces cannot be themed with CSS.
 for(const [from,to] of [['#25272b80','#c6d3de80'],['#303338','#f6f8fb']]){
  if(!html.includes(from))throw Error('Lite orientation palette hook missing: '+from);
  html=html.replaceAll(from,to);
 }
 html=html.replace(/<link rel="icon"[^>]*>/,'<link rel="icon" data-lite-icon href="data:image/svg+xml;base64,'+Buffer.from(icon).toString('base64')+'">');
 html=html.replace(/(<img class="brandmark" src=")[^"]+/, '$1data:image/svg+xml;base64,'+Buffer.from(icon).toString('base64'));
 html=html.replace(/<meta name="theme-color"[^>]*>/,'<meta name="theme-color" content="#1976c9">');
 html=html.replace(/(<select id="languageSelect"[^>]*>)(.*?)(<\/select>)/s,(_,a,options,c)=>a+options.replace(/<option value="([^"]+)"[^>]*>.*?<\/option>/g,(option,lang)=>profile.languages.includes(lang)?option:'')+c);
 html=html.replace(/<button id="lite(?:Models|Advanced|Theme)"[^>]*>.*?<\/button>/g,'');
 const menu=[];
 if(profile.features.modelGroups)menu.push('<button id="liteModels">模型与分组</button>');
 if(profile.features.advancedOptions)menu.push('<button id="liteAdvanced">高级选项</button>');
 html=html.replace('<summary>更多 ···</summary><div>','<summary>更多 ···</summary><div>'+menu.join(''));
 // Keep manual volume entry reachable after simplifying the toolbar.
 html=html.replace('<button id="manualBtn">输入体积</button>','');
 html=html.replace('<button id="helpBtn">','<button id="manualBtn">输入体积</button><button id="helpBtn">');
 html=html.replace('<label class="field-label">当前计价单价','<label class="field-label lite-price-field">当前计价单价');
 // Relocate existing controls: keep shared handlers, translation and geometry.
 const examples=['demoBtn','cubeBtn'].map(id=>{
  const pattern=new RegExp('<button id="'+id+'"[^>]*>.*?</button>');
  const match=html.match(pattern);if(!match)throw Error('Lite example hook missing: '+id);
  html=html.replace(pattern,'');return match[0];
 }).join('');
 html=html.replace('<details class="comparisons"','<div class="lite-examples" role="group" aria-label="快速开始">'+examples+'</div><details class="comparisons"');
 html=html.replace('<div id="viewport">','<div class="lite-model-picker" hidden><select id="liteModelSelect" aria-label="选择模型"></select><button id="liteRemoveModel" aria-label="删除当前模型">×</button></div><div id="viewport">');
 // Remove the previous prototype setup; the standard application script is untouched.
 html=html.replace(/<script>\(function\(\)\{var b=document.body;document.title='Metal Lab Lite v1\.0\.0';[\s\S]*?<\/script>/,'');
 const boot=`<script data-lite-profile>(function(){
 var profile=${JSON.stringify(profile)},b=document.body,menu=document.querySelector('.tools-menu'),select=document.getElementById('languageSelect');
 b.classList.remove('lite-dark','lite-library','lite-advanced');
 // Run before shared initLanguage restores a previously saved Japanese/Korean locale.
 try{if(profile.languages.indexOf(localStorage.getItem('metal-lab-language'))<0)localStorage.setItem('metal-lab-language','zh-CN');}catch(e){}
 menu.addEventListener('toggle',function(){if(menu.open)b.classList.remove('lite-library');});
 menu.addEventListener('click',function(e){if(e.target.closest('button'))menu.open=false;});
 document.addEventListener('click',function(e){if(!e.target.closest('.tools-menu'))menu.open=false;},true);
 document.addEventListener('keydown',function(e){if(e.key==='Escape'){menu.open=false;b.classList.remove('lite-library');}});
 if(document.getElementById('liteModels'))document.getElementById('liteModels').onclick=function(){b.classList.toggle('lite-library');menu.open=false;};
 if(document.getElementById('liteAdvanced'))document.getElementById('liteAdvanced').onclick=function(){b.classList.toggle('lite-advanced');menu.open=false;};
 var picker=document.getElementById('liteModelSelect'),container=picker.parentElement,list=document.getElementById('modelList');
 function syncModels(){var buttons=Array.from(list.querySelectorAll('[data-model]'));var values=buttons.map(function(button){return {id:button.dataset.model,name:button.querySelector('strong').textContent,active:!!button.closest('.model-group.active')};});
 var signature=JSON.stringify(values);if(picker.dataset.signature===signature)return;picker.dataset.signature=signature;picker.replaceChildren();values.forEach(function(v){var option=document.createElement('option');option.value=v.id;option.textContent=v.name;option.selected=v.active;picker.appendChild(option);});container.hidden=!values.length;
 }
 picker.onchange=function(){Array.from(list.querySelectorAll('[data-model]')).find(function(el){return el.dataset.model===picker.value;})?.click();};
 document.getElementById('liteRemoveModel').onclick=function(){Array.from(list.querySelectorAll('[data-remove-model]')).find(function(el){return el.dataset.removeModel===picker.value;})?.click();};
 new MutationObserver(syncModels).observe(list,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});syncModels();
 var guide={
 'zh-CN':['Lite 使用说明','导入 STL、OBJ、PLY、GLB 或 GLTF 模型，核对单位后查看体积和克重。没有模型时，可输入体积计算。','选择金属并核对密度；单价按当前显示货币填写。材料成本仅供估算，采购价格请自行确认。','顶部下拉框切换已导入模型，旁边 × 可删除当前模型。计算记录只显示当前模型的方案，可复制、重命名、排序、删除和导出打样单。','更多菜单可切换简体中文、繁体中文或 English，修改尺寸显示单位和显示货币，保存或打开 .mlab 工程。','快捷键：中键旋转，滚轮缩放，Shift＋中键平移，F 适配视图，Ctrl＋S 保存，Ctrl＋Shift＋S 另存为，Ctrl＋N 新建工作区。浏览器可能占用快捷键，可用顶部按钮。','Lite 保留基础计算，采用固定浅色界面。模型分组、尺寸编辑、几何导出与制作费用请使用标准版；现有工程数据会保留。'],
 'zh-TW':['Lite 使用說明','匯入 STL、OBJ、PLY、GLB 或 GLTF 模型，確認單位後檢視體積與克重。沒有模型時，可輸入體積計算。','選擇金屬並核對密度；單價依目前顯示貨幣填寫。材料成本僅供估算，採購價格請自行確認。','頂部下拉選單切換模型，旁邊 × 可刪除目前模型。計算記錄依模型顯示，可複製、重新命名、排序、刪除與匯出打樣單。','更多選單可切換簡體中文、繁體中文或 English，修改尺寸顯示單位及貨幣，儲存或開啟 .mlab 專案。','快速鍵：中鍵旋轉，滾輪縮放，Shift＋中鍵平移，F 適合視圖，Ctrl＋S 儲存，Ctrl＋Shift＋S 另存新檔，Ctrl＋N 新建工作區。瀏覽器可能佔用快速鍵，可用頂部按鈕。','Lite 保留基礎計算，固定使用淺色介面。模型分組、尺寸編輯、幾何匯出與製作費用請使用標準版；現有專案資料會保留。'],
 'en':['Lite user guide','Import an STL, OBJ, PLY, GLB or GLTF model and confirm its units to calculate volume and weight. You can also enter a known volume.','Select a metal and check its density. Enter the unit price in the selected currency. Material costs are estimates; confirm actual purchasing prices yourself.','Use the model selector above the viewport to switch models. The × button deletes the current model. Calculation records follow the current model and support duplication, renaming, ordering, deletion and sample sheet export.','Use More to change language, display units and currency, or save and open .mlab projects. Languages: Simplified Chinese, Traditional Chinese and English.','Shortcuts: middle drag to rotate, wheel to zoom, Shift + middle drag to pan, F to fit, Ctrl+S to save, Ctrl+Shift+S to save as, Ctrl+N for a new workspace. Use the toolbar if the browser reserves a shortcut.','Lite provides basic calculation in a fixed light interface. Use Standard for groups, dimension editing, geometry export and fabrication fees. Existing project data is retained.']};
 function updateGuide(){var lang=select.value||'zh-CN',copy=guide[lang]||guide['zh-CN'];var content=document.getElementById('liteGuide');content.replaceChildren();copy.forEach(function(text,index){var node=document.createElement(index?'p':'h2');node.textContent=text;content.appendChild(node);});document.title='Metal Lab Lite v1.0.0';}
 var help=document.getElementById('helpDialog');Array.from(help.children).forEach(function(el){if(!el.classList.contains('dialog-top')&&!el.classList.contains('dialog-actions'))el.remove();});var content=document.createElement('div');content.id='liteGuide';content.className='lite-guide';content.setAttribute('data-user-text','');help.insertBefore(content,help.querySelector('.dialog-actions'));
 select.addEventListener('change',function(){setTimeout(updateGuide,0);});
 window.addEventListener('load',function(){updateGuide();['recordsPanel','costPanel','sizeDetails','exportDetails'].forEach(function(id){var el=document.getElementById(id);if(el)el.open=false;});});
 updateGuide();
 var volumeLock=document.getElementById('volumeLock'),volumeField=document.getElementById('volumeInput');
 function updateLock(){var lang=select.value||'zh-CN',locked=volumeField.disabled;volumeLock.dataset.liteLocked=String(locked);volumeLock.dataset.liteLabel=lang==='en'?(locked?'Locked':'Unlocked'):lang==='zh-TW'?(locked?'鎖定':'已解鎖'):(locked?'锁定':'已解锁');}
 new MutationObserver(updateLock).observe(volumeField,{attributes:true,attributeFilter:['disabled']});select.addEventListener('change',function(){setTimeout(updateLock,0);});updateLock();
 })();</script>`;
 // Place Lite bootstrap before shared code so preference normalization takes effect.
 html=html.replace('<script>',boot+'<script>');
 html=html.replace('</style>',css+'</style>');
 return html;
}
