// Densities are room-temperature starting points in g/cm³, never live prices.
// Alloys vary by grade and must be checked against the chosen supplier's material.
export const materials=Object.freeze({
 gold:{name:'黄金',symbol:'Au',density:19.30,color:'#d8ad6a'},
 silver:{name:'白银',symbol:'Ag',density:10.49,color:'#cbd2de'},
 copper:{name:'铜',symbol:'Cu',density:8.96,color:'#c38c6b'},
 aluminum:{name:'铝',symbol:'Al',density:2.70,color:'#c5cbd0'},
 tin:{name:'锡',symbol:'Sn',density:7.287,color:'#b6bec7'},
 zinc:{name:'锌',symbol:'Zn',density:7.134,color:'#9faeb7'},
 brass:{name:'黄铜（参考）',symbol:'CuZn',density:8.5,color:'#c7a560'},
 bronze:{name:'青铜（参考）',symbol:'CuSn',density:8.8,color:'#a9875f'},
 castIron:{name:'铸铁（参考）',symbol:'Fe',density:7.23,color:'#8b9398'},
 stainless:{name:'不锈钢（参考）',symbol:'FeCr',density:7.9,color:'#b3bcc3'},
 titanium:{name:'钛',symbol:'Ti',density:4.5,color:'#a8adb5'},
 platinum:{name:'铂金',symbol:'Pt',density:21.5,color:'#c8cdd1'},
 palladium:{name:'钯金',symbol:'Pd',density:12.0,color:'#adb7be'},
 iron:{name:'铁',symbol:'Fe',density:7.87,color:'#929a9f'},
 nickel:{name:'镍',symbol:'Ni',density:8.9,color:'#b7bdbd'},
 custom:{name:'自定义',symbol:'M',density:10,color:'#b6b8c4'}
});
export const otherMetalKeys=Object.freeze(['aluminum','tin','zinc','brass','bronze','castIron','stainless','titanium','platinum','palladium','iron','nickel']);
