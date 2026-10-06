import {analyzeFile,convertFile} from './stream.mjs';
self.onmessage=async({data})=>{
 if(data.type==='ack'){self.resumeWrite?.();return;}
 try{
 const options={previewLimit:data.previewLimit,tempName:data.tempName,progress:(fraction,label)=>self.postMessage({type:'progress',fraction,label})};
 if(data.type==='analyze'){const result=await analyzeFile(data.file,data.ext,options);self.postMessage({type:'result',result},[result.positions.buffer]);}
 if(data.type==='export'){await convertFile(data.file,data.ext,data.targetExt,data.meta,async b=>{await new Promise(resolve=>{self.resumeWrite=resolve;self.postMessage({type:'chunk',buffer:b.buffer},[b.buffer]);});},options);self.postMessage({type:'result',result:true});}
 }catch(e){self.postMessage({type:'error',message:e.message});}
};
