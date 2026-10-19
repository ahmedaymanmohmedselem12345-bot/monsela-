import {mkdir,rm,copyFile,cp} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.dirname(fileURLToPath(import.meta.url)),out=path.join(root,'dist');
const files=['index.html','admin.html','reset-password.html','about.html','contact.html','faq.html','privacy.html','returns.html','shipping.html','terms.html','favicon.svg','manifest.json','robots.txt','sitemap.xml'];
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
for(const file of files)await copyFile(path.join(root,file),path.join(out,file));
await cp(path.join(root,'assets'),path.join(out,'assets'),{recursive:true});
console.log('Built public site: '+files.length+' pages/assets plus assets directory. Private docs, tests and backups excluded.');
