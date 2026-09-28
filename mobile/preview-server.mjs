import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const address=process.env.METAL_LAB_PREVIEW_HOST||'127.0.0.1';
const port=Number(process.env.METAL_LAB_PREVIEW_PORT||8787);
const html=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist/金属工坊.html');

http.createServer(async(request,response)=>{
  if(request.method!=='GET'||!['/','/index.html'].includes(new URL(request.url,'http://localhost').pathname)){
    response.writeHead(404).end('Not found');return;
  }
  try{
    response.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
    response.end(await readFile(html));
  }catch(error){
    response.writeHead(500).end('Preview unavailable');
    console.error(error);
  }
}).listen(port,address,()=>console.log(`Metal Lab mobile preview: http://${address}:${port}/`));
