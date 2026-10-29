/* Dos perfiles con catálogos filtrados no deben proponer el mismo ID ni superar los enteros seguros. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{webcrypto}=require('node:crypto');
const source=fs.readFileSync(require('node:path').join(__dirname,'../portal-private/views/portal.php'),'utf8');
const code=source.slice(source.indexOf('const nextId ='),source.indexOf('const prog ='));
const next=vm.runInNewContext(code+';nextId',{crypto:webcrypto,Uint32Array});
const ids=new Set();for(let i=0;i<1000;i++){const id=next([]);assert.ok(Number.isSafeInteger(id)&&id>0);assert.ok(!ids.has(id),'Colisión entre vistas vacías de distintos perfiles');ids.add(id);}
assert.ok(Number.isSafeInteger(next([{id:Number.MAX_SAFE_INTEGER}])));
console.log('1001 identificadores académicos seguros y sin colisiones entre vistas filtradas.');
