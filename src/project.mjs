export const PROJECT_EXTENSION='.mlab';
export function serializeProject(state){const workspace={...state,models:state.models.map(m=>({...m,positions:Array.from(m.positions)}))};return JSON.stringify({format:'metal-lab-project',formatVersion:1,workspace});}
export function parseProject(json){const raw=JSON.parse(json);if(raw?.format==='metal-lab-project'&&raw.formatVersion===1&&raw.workspace)return raw.workspace;if(raw?.format===undefined&&raw?.version===1&&Array.isArray(raw.models)&&Array.isArray(raw.cards))return raw;throw Error('不是金属工坊工程文件，或文件格式版本不受支持');}
