import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
const args=process.argv.slice(2);const value=(flag,fallback)=>{const i=args.indexOf(flag);return i>=0?args[i+1]:fallback};
const host=value("--host","0.0.0.0"),port=Number(value("--port","4173"));const root=process.cwd();
const types={".html":"text/html;charset=utf-8",".js":"text/javascript;charset=utf-8",".css":"text/css;charset=utf-8",".csv":"text/csv;charset=utf-8",".md":"text/markdown;charset=utf-8",".json":"application/json;charset=utf-8"};
http.createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,"http://local").pathname);const requested=pathname==="/"?"index.html":pathname.slice(1);const file=path.resolve(root,requested);if(!file.startsWith(root+path.sep))throw new Error("invalid path");const data=await fs.readFile(file);res.writeHead(200,{"content-type":types[path.extname(file)]||"application/octet-stream","cache-control":"no-store"});res.end(data)}catch{res.writeHead(404,{"content-type":"text/plain;charset=utf-8"});res.end("Not found")}}).listen(port,host,()=>console.log(`Static server listening on http://${host}:${port}`));
