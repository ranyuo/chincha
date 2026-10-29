/* Alta y publicación de páginas adicionales. Solo base local desechable; conserva los registros previos. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const base=process.env.PISCO_BASE_URL||'http://127.0.0.1:8083';
if(!['127.0.0.1','localhost'].includes(new URL(base).hostname))throw Error('Solo pruebas locales.');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 const marker='qa-pagina-'+Date.now();let admin,created,count=0;
 try{
  const context=await browser.newContext({reducedMotion:'reduce'});await context.route('https://**/*',r=>r.abort());admin=await context.newPage();
  const errors=[];admin.on('pageerror',e=>errors.push(e.message));
  const go=async route=>admin.goto(base+'/?qa='+Date.now()+'#/admin/'+route,{waitUntil:'domcontentloaded'});
  await go('paginas');await admin.locator('#lg-u').fill('admin');await admin.locator('#lg-p').fill('PruebaOriginal-2026!');await admin.locator('[data-login] button[type=submit]').click();await admin.waitForFunction(()=>window.PORTAL_BOOTSTRAP?.user);
  const guestContext=await browser.newContext({reducedMotion:'reduce'});await guestContext.route('https://**/*',r=>r.abort());const guest=await guestContext.newPage();guest.on('pageerror',e=>errors.push(e.message));
  const publicGo=async route=>guest.goto(base+'/?qa='+Date.now()+'#'+route,{waitUntil:'domcontentloaded'});
  const check=(ok,label)=>{assert.ok(ok,label);count++;console.log('OK '+label)};
  const save=async()=>{await admin.getByRole('button',{name:'Guardar cambios',exact:true}).click();await admin.waitForFunction(()=>!document.querySelector('[data-cf]'));};
  await go('paginas');await admin.locator('a[href="#/admin/paginas/nuevo"]').click();
  await admin.locator('[name=titulo]').fill(marker);await admin.locator('[contenteditable][data-name=contenido]').fill('Contenido de la nueva página sintética.');await save();
  created=await admin.evaluate(marker=>DB.paginas.find(p=>p.titulo===marker)?.id,marker);check(created,'Alta desde el botón Nueva página');
  const url='#/paginas/'+marker;
  await publicGo('/paginas/'+marker);check((await guest.locator('main').innerText()).includes('Página no encontrada'),'Borrador inaccesible para visitante');
  await go('paginas/'+created);await admin.locator('[data-prev]').click();check((await admin.locator('main').last().innerText()).includes('Contenido de la nueva página'),'Vista previa del borrador en su ruta');
  await go('paginas/'+created);await admin.locator('[name=estado]').selectOption('Publicada');await save();
  await publicGo('/paginas/'+marker);check((await guest.locator('main').innerText()).includes('Contenido de la nueva página'),'Página publicada accesible por enlace directo');
  check(await guest.locator('.mainnav a[href="'+url+'"]').count(),'Página publicada en el menú Otras Páginas');
  await publicGo('/buscar?q='+marker);check(await guest.locator('main article h2 a[href="'+url+'"]').count(),'Página publicada en el buscador');
  await publicGo('/mapa-del-sitio');check(await guest.locator('main a[href="'+url+'"]').count(),'Página publicada en el mapa del sitio');
  const pending=guest.waitForEvent('download');await guest.locator('[data-sm]').click();const dl=await pending;const xml=await fs.readFile(await dl.path(),'utf8');check(xml.includes(new URL(url,base+'/').href),'Sitemap descargado contiene la ruta pública y el dominio actual');
  await go('paginas/'+created);await admin.locator('[name=slug]').fill(marker+'-editada');await admin.locator('[contenteditable][data-name=contenido]').fill('Contenido editado persistente.');await save();
  await publicGo('/paginas/'+marker+'-editada');check((await guest.locator('main').innerText()).includes('editado persistente'),'Edición de contenido y slug persistente');
  await publicGo('/paginas/'+marker);check((await guest.locator('main').innerText()).includes('Página no encontrada'),'La ruta anterior no muestra otra página');
  await go('paginas/'+created);await admin.locator('[name=estado]').selectOption('Borrador');await save();
  await publicGo('/paginas/'+marker+'-editada');check((await guest.locator('main').innerText()).includes('Página no encontrada'),'Despublicación retira el acceso directo');
  check(await guest.locator('.mainnav a[href*="'+marker+'"]').count()===0,'Despublicación retira el enlace del menú');
  await publicGo('/buscar?q='+marker);check(await guest.locator('main article h2 a[href*="'+marker+'"]').count()===0,'Despublicación retira el resultado del buscador');
  await go('paginas/'+created);await admin.locator('[name=estado]').selectOption('Publicada');await save();
  await go('paginas');await admin.locator('#lf-q').fill(marker);await admin.locator('[data-lf] button').first().click();await admin.locator('tr[data-id="'+created+'"] [data-act=del]').click();await admin.getByRole('dialog').getByRole('button',{name:'Eliminar',exact:true}).click();
  await publicGo('/paginas/'+marker+'-editada');check((await guest.locator('main').innerText()).includes('Página no encontrada'),'Papelera retira la página publicada');
  await go('paginas/pg-presentacion');check(await admin.locator('[name=slug]').isDisabled(),'Ruta institucional protegida en el editor');
  await publicGo('/nosotros/presentacion');check(!(await guest.locator('main').innerText()).includes('Página no encontrada'),'Ruta institucional original conservada');
  check(errors.length===0,'Sin errores JavaScript');console.log(count+' comprobaciones de páginas aprobadas.');
 }finally{
  if(admin&&created){await admin.goto(base+'/?qa='+Date.now()+'#/admin/paginas',{waitUntil:'domcontentloaded'});await admin.evaluate(id=>{DB.paginas=DB.paginas.filter(p=>p.id!==id);if(!saveDB())throw Error('No se retiró el registro de prueba');},created);}
  await browser.close();
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
