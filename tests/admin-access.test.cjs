const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../admin.html'),'utf8');
const gate=html.slice(html.indexOf('let adminReady=false;'),html.indexOf("document.getElementById('whoami').textContent",html.indexOf('let adminReady=false;')))+'return true;\n}';
async function run({user={id:'test'},permission=true,error=null}={}){
 const events=[],status={style:{},textContent:''};let calls=0;
 const ctx={sb:{auth:{getUser:async()=>({data:{user}})},rpc:async()=>{calls++;return {data:permission,error};}},document:{getElementById:()=>status},adminScreen:{classList:{remove(){}}},authScreen:{classList:{add(){}}},window:{dispatchEvent:e=>events.push(e.type)},Event:class{constructor(type){this.type=type}}};vm.createContext(ctx);vm.runInContext(gate,ctx);const result=await vm.runInContext('showAdmin()',ctx);return {result,events,status,calls,ctx};
}
test('anonymous session cannot authorize admin extras',async()=>{const r=await run({user:null});assert.equal(r.events.length,0);assert.equal(r.calls,0);});
test('customer role cannot authorize admin extras',async()=>{const r=await run({permission:false});assert.equal(r.events.length,0);assert.match(r.status.textContent,/غير مصرح/);});
test('missing or failed permission RPC fails closed',async()=>{const r=await run({error:{message:'function not found'}});assert.equal(r.events.length,0);assert.match(r.status.textContent,/صلاحية/);});
test('verified admin initializes extras only once',async()=>{const r=await run();assert.deepEqual(r.events,['monsela:admin-ready']);await vm.runInContext('showAdmin()',r.ctx);assert.equal(r.events.length,1);});
