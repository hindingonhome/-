const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
const asar=require(require.resolve('@electron/asar',{paths:[require.resolve('electron-builder')]}));
const source=fs.readFileSync('dist-lite/MetalLab-Lite-1.1.0-Review.html');
for(const platform of ['win','linux']){
 const root='lite-desktop/desktop-dist/'+platform+'-unpacked',archive=path.join(root,'resources/app.asar');
 assert.ok(asar.extractFile(archive,'dist/金属工坊.html').equals(source),platform+' final HTML');
 assert.ok(asar.extractFile(archive,'desktop/icon.ico').equals(fs.readFileSync('src/assets/lite-icon.ico')),platform+' icon');
 const main=asar.extractFile(archive,'desktop/main.cjs').toString();assert.match(main,/cn\.metallab\.lite/);assert.match(main,/path\.join\(app.getPath\('appData'\),'MetalLab Lite'\)/);
 const pkg=JSON.parse(asar.extractFile(archive,'package.json'));assert.equal(pkg.version,'1.1.0');assert.equal(pkg.name,'metal-lab-lite');
 assert.ok(fs.readFileSync(path.join(root,'MetalLab-brand.ico')).equals(fs.readFileSync('src/assets/lite-icon.ico')));
}
console.log('Both packaged applications match final Lite HTML, icons, version and identity');
