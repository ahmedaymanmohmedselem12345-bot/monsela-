const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
for(const file of fs.readdirSync(root).filter(f=>f.endsWith('.html'))){
 test(file+' inline scripts parse',()=>{const html=fs.readFileSync(path.join(root,file),'utf8');for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){if(m[1].includes('ld+json')){if(m[2].trim())JSON.parse(m[2]);}else new vm.Script(m[2]);}});
 test(file+' local assets exist',()=>{const html=fs.readFileSync(path.join(root,file),'utf8');for(const m of html.matchAll(/(?:src|href)="(assets\/[^"$]+)"/g))assert.ok(fs.existsSync(path.join(root,m[1])),m[1]);});
}
for(const file of fs.readdirSync(path.join(root,'assets')).filter(f=>f.endsWith('.js')))test(file+' parses',()=>new vm.Script(fs.readFileSync(path.join(root,'assets',file),'utf8')));
test('production excludes backups and SQL',()=>{const excluded=fs.readFileSync(path.join(root,'.vercelignore'),'utf8');for(const item of ['database/','tests/','backup-original.zip'])assert.ok(excluded.includes(item));});
test('no public administrator registration handler remains',()=>{const html=fs.readFileSync(path.join(root,'admin.html'),'utf8');assert.ok(!html.includes('sb.auth.signUp('));assert.ok(html.includes("sb.rpc('monsela_is_admin')"));assert.ok(html.indexOf("sb.rpc('monsela_is_admin')")<html.indexOf("adminScreen.classList.add('show')"));});
test('no public coupon-table query in storefront',()=>assert.ok(!fs.readFileSync(path.join(root,'index.html'),'utf8').includes("sb.from('coupons')")));
test('password reset is recovery-event gated',()=>{const js=fs.readFileSync(path.join(root,'assets/password-reset.js'),'utf8');assert.ok(js.includes("event==='PASSWORD_RECOVERY'"));assert.ok(js.includes('if(!recoveryReady)'));});
