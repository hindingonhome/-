export function nearestAxisFromDirection({x,y,z}) {
  const axes=[['right',x],['left',-x],['top',y],['bottom',-y],['front',z],['back',-z]];
  return axes.reduce((best,axis)=>axis[1]>best[1]?axis:best)[0];
}
