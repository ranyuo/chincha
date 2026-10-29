<?php
declare(strict_types=1);
require dirname(__DIR__).'/portal-private/bootstrap.php';
$seed=json_decode(file_get_contents(dirname(__DIR__).'/portal-private/data/portal.json'),true,flags:JSON_THROW_ON_ERROR);
$user=['rol'=>'admin','usuario'=>'qa','nombre'=>'QA'];$count=0;
function denied(callable $operation,string $label):void{global$count;try{$operation();}catch(PortalError$e){if($e->status!==422)throw$e;$count++;echo"OK $label\n";return;}throw new RuntimeException('No se rechazó: '.$label);}
function validate(array $next):array{global$seed,$user;PortalRules::apply($seed,$next,$user);PortalDomain::validate($seed,$next,$user);return$next;}
$fixture=['id'=>'qa-custom-page','titulo'=>'Página sintética','slug'=>'pagina-sintetica','contenido'=>'<p>Contenido QA</p>','estado'=>'Publicada'];
$next=$seed;$next['paginas'][]=$fixture;$saved=validate($next);
if(end($saved['paginas'])['clave']!=='custom-qa-custom-page')throw new RuntimeException('La nueva página no recibió una clave estable.');$count++;echo"OK Alta de página adicional publicada\n";
foreach(['reserved','duplicate','slug','blank','delete','remove','rename']as$case){denied(function()use($seed,$fixture,$case){$d=$seed;if($case==='delete')$d['paginas'][0]['deleted']=true;elseif($case==='remove')array_shift($d['paginas']);elseif($case==='rename')$d['paginas'][0]['slug']='ruta-distinta';else{$r=$fixture;if($case==='reserved')$r['clave']='presentacion';if($case==='duplicate')$r['slug']=$seed['paginas'][0]['slug'];if($case==='slug')$r['slug']='../admin';if($case==='blank')$r['contenido']='<p><br></p>';$d['paginas'][]=$r;}validate($d);},$case);}
echo"$count comprobaciones de páginas aprobadas.\n";
