export const DISPLAY_UNITS=Object.freeze([
 {code:'mm',name:'毫米 mm',millimeters:1},
 {code:'cm',name:'厘米 cm',millimeters:10},
 {code:'in',name:'英寸 in',millimeters:25.4},
 {code:'ft',name:'英尺 ft',millimeters:304.8},
]);

const unitFactor=new Map(DISPLAY_UNITS.map(({code,millimeters})=>[code,millimeters]));
const localeCurrency=Object.freeze({'zh-CN':'CNY','zh-TW':'HKD',en:'USD',ja:'JPY',ko:'KRW'});

function factorFor(unit){const factor=unitFactor.get(unit);if(!factor)throw Error(`不支持的长度单位：${unit}`);return factor;}
export function lengthFromMillimeters(value,unit){if(typeof value!=='number'||!Number.isFinite(value))throw Error('尺寸必须是有限数字');return value/factorFor(unit);}
export function lengthToMillimeters(value,unit){if(typeof value!=='number'||!Number.isFinite(value))throw Error('尺寸必须是有限数字');return value*factorFor(unit);}
export function defaultCurrencyForLocale(locale){return localeCurrency[locale]??'CNY';}
