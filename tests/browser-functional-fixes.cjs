/* Solo una base local desechable; ejecutar después de parity.php. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs'),crypto=require('node:crypto');
const base=process.env.PISCO_BASE_URL||'http://127.0.0.1:8083';
if(!['localhost','127.0.0.1'].includes(new URL(base).hostname))throw Error('Solo pruebas locales.');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 let count=0;
 const ok=(test,label)=>{assert.ok(test,label);count++;console.log('OK',label)};
 try{
  const context=await browser.newContext();await context.route('https://**/*',r=>r.abort());
  const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  const go=async route=>{await p.goto(base+'/#'+route);await p.locator('main').waitFor()};
  const login=async(page,user)=>{await page.goto(base+'/#/admin');await page.locator('#lg-u').fill(user);await page.locator('#lg-p').fill('PruebaOriginal-2026!');await page.locator('[data-login] button[type=submit]').click();await page.waitForFunction(()=>window.PORTAL_BOOTSTRAP?.user)};
  await login(p,'admin');
  // Unit boundaries exercise the same shared functions used by both document filters.
  const years=await p.evaluate(()=>({range:validityYears('2024–2030'),none:validityYears('Publicada en fuente institucional'),inner:validityMatches('2026 - 2028','2027'),start:validityMatches('2026 - 2028','2026'),end:validityMatches('2026 - 2028','2028'),outside:validityMatches('2026 - 2028','2029'),single:validityMatches('2026','2026'),noneMatch:validityMatches('Publicada en fuente institucional','sin-anio')}));
  assert.deepEqual(years.range,['2024','2025','2026','2027','2028','2029','2030']);
  ok(!years.none.length&&years.inner&&years.start&&years.end&&!years.outside&&years.single&&years.noneMatch,'Años, extremos, intervalos y textos sin año');
  const originalCategory=await p.evaluate(()=>DB.tupa.find(r=>r.codigo==='1.1').categoria);
  for(const custom of [false,true]){
   const rec=await p.evaluate(custom=>{const r=DB.tupa.find(r=>r.codigo==='1.1');if(custom){r.categoria='Categoría personalizada QA';if(!saveDB())throw Error('No se guardó fixture')}return structuredClone(r)},custom);
   await go('/admin/tupa/'+rec.id);
   assert.equal(await p.locator('[name=categoria]').inputValue(),rec.categoria);
   await p.getByRole('button',{name:'Guardar cambios',exact:true}).click();await p.reload();
   const saved=await p.evaluate(id=>DB.tupa.find(r=>r.id===id),rec.id);
   for(const k of ['id','codigo','categoria','monto','cuenta','requisitos'])assert.deepEqual(saved[k],rec[k],k);
   ok(true,'Editor conserva categoría '+(custom?'personalizada':'institucional')+' y valores tras recarga');
  }
  await p.evaluate(category=>{DB.tupa.find(r=>r.codigo==='1.1').categoria=category;if(!saveDB())throw Error('No se restauró categoría')},originalCategory);
  await go('/transparencia/tupa');await p.locator('#tf-s').fill('MATRÍCULA');
  ok((await p.locator('#tres').innerText()).includes('4.1 MATRÍCULA REGULAR'),'Búsqueda MATRÍCULA incluye 4.1');
  await p.locator('#tf-s').fill('');
  const codes=await p.locator('#tres tbody tr td:first-child').allTextContents();
  ok(codes.indexOf('10.2')<codes.indexOf('10.10'),'Orden público natural 10.2 antes de 10.10');
  await go('/admin/tupa');
  ok(await p.evaluate(()=>SPECS.tupa.sort({codigo:'10.2'},{codigo:'10.10'})<0),'Orden administrativo natural');
  await go('/admin/documentos');
  const options=await p.locator('select[name=anio] option').allTextContents();
  ok(options.includes('2026')&&options.includes('Sin año especificado')&&!options.includes('Publ'),'Filtro administrativo sin fragmentos de texto');
  await p.locator('select[name=anio]').selectOption('2026');
  ok((await p.locator('main').innerText()).includes('2024-2030'),'Filtro administrativo incluye año interior del PEI');
  await go('/transparencia/documentos-gestion');await p.locator('#df-y').selectOption('2026');
  ok((await p.locator('#dres').innerText()).includes('2024-2030'),'Filtro público incluye año interior del PEI');
  await p.locator('#df-y').selectOption('sin-anio');
  ok((await p.locator('#dres').innerText()).includes('Publicada en fuente institucional'),'Filtro público sin año');
  ok(!(await p.locator('#dres').innerText()).includes('Vigente'),'Publicado no se presenta como vigencia acreditada');
  await go('/admision');
  ok(await p.getByRole('button',{name:'Temario de admisión 2025 (histórico)',exact:true}).count(),'Etiqueta fiel del temario histórico');
  const url=await p.evaluate(()=>DB.admisiones.find(a=>a.vigente).prospecto.url);
  const response=await p.request.get(base+url);assert.equal(response.status(),200);
  const actual=crypto.createHash('sha256').update(await response.body()).digest('hex');
  const expected=crypto.createHash('sha256').update(fs.readFileSync(require('node:path').join(__dirname,'../public_html',url))).digest('hex');
  ok(actual===expected,'PDF descargado idéntico al archivo institucional');
  await go('/admin/eventos/nuevo');
  ok((await p.locator('main').innerText()).includes('Obligatorio al publicar'),'Ayuda condicional visible');
  // Force an empty publication map via the real save, then reload before using the UI.
  await go('/admin/ix-horarios');
  await p.evaluate(()=>{DB.academico.publicados={};if(!saveDB())throw Error('No se vació mapa')});await p.reload();
  const selectGroup=async()=>{await p.locator('#hg_p').selectOption('1');await p.locator('#hg_c').selectOption('VI');await p.locator('#hg_s').selectOption('B');await p.locator('#hg_t').selectOption('Tarde')};
  await selectGroup();await p.locator('[data-act=publish]').click();await p.reload();await selectGroup();
  ok(await p.locator('[data-act=unpublish]').count(),'Publicación de horario vacío→objeto persiste al recargar');
  const student=await browser.newContext();await student.route('https://**/*',r=>r.abort());const sp=await student.newPage();
  await login(sp,'70001001');await sp.goto(base+'/#/admin/ix-horarios');
  ok((await sp.locator('main').innerText()).includes('Unidad de prueba'),'Alumno coincidente lee su clase publicada');
  await p.locator('[data-act=unpublish]').click();await sp.reload();
  ok(!(await sp.locator('main').innerText()).includes('Unidad de prueba'),'Retirar publicación oculta la clase al alumno');
  await student.close();ok(!errors.length,'Sin errores JavaScript');
  console.log(`${count} comprobaciones de navegador aprobadas.`);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
