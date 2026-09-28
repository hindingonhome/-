export const feeCatalog=Object.freeze([
 {kind:'bench',name:'手工加工',mode:'perGram',hint:'按成品金属克重计费'},
 {kind:'design',name:'设计 / CAD',mode:'fixed',hint:'按件输入设计费'},
 {kind:'prototype',name:'蜡版 / 树脂打样',mode:'fixed',hint:'按件输入打样费'},
 {kind:'printing',name:'金属打印',mode:'fixed',hint:'按件输入打印费'},
 {kind:'mold',name:'开模',mode:'fixed',hint:'按件输入模具费'},
 {kind:'casting',name:'铸造',mode:'perGram',hint:'可按成品克重报价'},
 {kind:'assembly',name:'焊接 / 组装',mode:'fixed',hint:'按件输入工费'},
 {kind:'finishing',name:'修整 / 抛光',mode:'fixed',hint:'按件输入工费'},
 {kind:'lacquer',name:'大漆工艺',mode:'fixed',hint:'按件输入漆面费用'},
 {kind:'pinback',name:'胸针扣 / 配件',mode:'fixed',hint:'按件输入配件费用'},
 {kind:'setting',name:'镶嵌',mode:'perUnit',hint:'按颗计费，填写数量'},
 {kind:'engraving',name:'刻字 / 雕刻',mode:'perUnit',hint:'按字符或处计费，填写数量'},
 {kind:'plating',name:'电镀 / 镀铑',mode:'fixed',hint:'按件输入处理费'},
 {kind:'assay',name:'检测 / 打印记',mode:'fixed',hint:'按件输入服务费'},
 {kind:'loss',name:'金属损耗',mode:'percentMaterial',hint:'材料费百分比，不是工时费'},
 {kind:'packaging',name:'包装',mode:'fixed',hint:'按件输入包装费'},
 {kind:'custom',name:'其他费用',mode:'fixed',hint:'自定义名称与计价方式'}
]);
export const feeModes=Object.freeze({perGram:'元 / g',fixed:'元 / 件',perUnit:'元 / 数量',percentMaterial:'材料费 %'});
export function makeFee(kind){const preset=feeCatalog.find(x=>x.kind===kind);if(!preset)throw Error('费用类型无效');return {id:crypto.randomUUID(),kind,name:preset.name,mode:preset.mode,rate:null,quantity:1};}
export function validateFees(input){if(input===undefined)return [];if(!Array.isArray(input)||input.length>30)throw Error('费用记录过多或格式无效');const ids=new Set();return input.map(f=>{if(!f||typeof f.id!=='string'||!f.id||ids.has(f.id)||!feeCatalog.some(x=>x.kind===f.kind)||typeof f.name!=='string'||!f.name.trim()||f.name.length>80||!Object.hasOwn(feeModes,f.mode)||!(f.rate===null||Number.isFinite(f.rate)&&f.rate>=0&&f.rate<=1e9)||!Number.isFinite(f.quantity)||f.quantity<=0||f.quantity>1e6)throw Error('制作费用记录无效');if(f.mode==='percentMaterial'&&f.rate>100)throw Error('金属损耗率不能超过 100%');ids.add(f.id);return {id:f.id,kind:f.kind,name:f.name.trim(),mode:f.mode,rate:f.rate,quantity:f.quantity};});}
export function calculateFees(input,mass,materialCost){const fees=validateFees(input),lines=[],active=[];for(const f of fees){let amount=null;if(f.rate!==null){if(f.mode==='fixed')amount=f.rate;else if(f.mode==='perUnit')amount=f.rate*f.quantity;else if(f.mode==='perGram'&&Number.isFinite(mass))amount=f.rate*mass;else if(f.mode==='percentMaterial'&&Number.isFinite(materialCost))amount=materialCost*f.rate/100;active.push(amount);}lines.push({...f,amount});}const making=active.some(x=>x===null)?null:active.reduce((a,b)=>a+b,0),total=making!==null&&Number.isFinite(materialCost)?making+materialCost:null;if(![making,total].filter(x=>x!==null).every(Number.isFinite))throw Error('费用合计过大');return {lines,making,total};}
