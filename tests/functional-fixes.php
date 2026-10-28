<?php
declare(strict_types=1);
ob_start();
require dirname(__DIR__).'/portal-private/bootstrap.php';
$path=getenv('PORTAL_CONFIG_FILE');
if(!$path||!str_ends_with($path,'config.test.php'))throw new RuntimeException('Solo config.test.php.');
$config=require $path;
if(!str_ends_with($config['db_name'],'_test'))throw new RuntimeException('Solo base _test.');
$app=portal_app();$db=$app->db();$n=0;
function verify(bool $ok,string $message):void {global $n;if(!$ok)throw new RuntimeException($message);$n++;echo "OK $message\n";}
$seed=json_decode(file_get_contents(dirname(__DIR__).'/portal-private/data/portal.json'),true,flags:JSON_THROW_ON_ERROR);
$legacy=$seed;
foreach($legacy['tupa'] as &$r){
 if($r['codigo']==='4.1')$r['denominacion']='4.1 ATRÍCULA REGULAR';
 if($r['codigo']==='10.6')$r['denominacion']='10.6 CURSO DE OFIRMÁTICA Y/O EXCEL (PRESENCIAL) - MES 3';
 if($r['categoria']==='6.- CONSTANCIAS Y CERTIFICADOS')$r['categoria']='6.- CONSTANCIA Y CERTIFICADOS';
 if($r['categoria']==='12.- ALQUILERES')$r['categoria']='12.-ALQUILERES';
}unset($r);
verify(PortalContent::normalize($legacy)===$seed,'Corrige exclusivamente las variantes confirmadas del paquete Chincha');
$custom=$legacy;$custom['tupa'][0]['codigo']='4.1';$custom['tupa'][0]['denominacion']='Servicio personalizado';$custom['tupa'][0]['categoria']='Categoría propia';
$normal=PortalContent::normalize($custom);
verify($normal['tupa'][0]===$custom['tupa'][0],'Conserva denominación y categoría personalizadas');
foreach($legacy['tupa'] as $i=>$row){$other=$normal['tupa'][$i];if($i===0)continue;unset($row['categoria'],$row['denominacion'],$other['categoria'],$other['denominacion']);verify($row===$other,'Conserva ID, importe, cuenta y requisitos '.$row['codigo']);}
verify(PortalContent::normalize($normal)===$normal,'Normalización repetible');
$wire=PortalContent::forJson(['data'=>['academico'=>['publicados'=>[]]]]);
verify(str_contains(json_encode($wire),'"publicados":{}'),'Mapa vacío se sirve como objeto JSON');
$key='1|VI|B|Tarde|2026-II';
$wire=PortalContent::forJson(['data'=>['academico'=>['publicados'=>[$key=>['por'=>'QA']]]]]);
verify(json_decode(json_encode($wire),true)['data']['academico']['publicados'][$key]['por']==='QA','Mapa publicado conserva claves de grupo');
// Exercise the updater twice inside a transaction; always restore the pre-test state.
$before=$db->query('SELECT data,revision FROM pisco_state WHERE id=1')->fetch();
if(!$before)throw new RuntimeException('Ejecuta parity.php primero.');
$users=$db->query('SELECT * FROM pisco_users ORDER BY id')->fetchAll();
$db->beginTransaction();
try{
 $data=json_decode($before['data'],true,flags:JSON_THROW_ON_ERROR);$data['tupa']=$legacy['tupa'];
 $db->prepare('UPDATE pisco_state SET data=? WHERE id=1')->execute([json_encode($data,JSON_THROW_ON_ERROR)]);
 PortalSchema::apply($db);
 $once=$db->query('SELECT data,revision FROM pisco_state WHERE id=1')->fetch();
 $expected=$data;$expected['tupa']=$seed['tupa'];
 verify(json_decode($once['data'],true)===$expected,'Actualiza catálogo existente sin reimportar ni alterar datos operativos');
 verify((int)$once['revision']===(int)$before['revision']+1,'Actualización efectiva incrementa revisión una vez');
 PortalSchema::apply($db);
 verify($db->query('SELECT data,revision FROM pisco_state WHERE id=1')->fetch()===$once,'Segunda actualización no modifica datos ni revisión');
 verify($db->query('SELECT * FROM pisco_users ORDER BY id')->fetchAll()===$users,'Conserva cuentas, contraseñas y permisos');
}finally{if($db->inTransaction())$db->rollBack();$db->prepare('UPDATE pisco_state SET data=?,revision=? WHERE id=1')->execute([$before['data'],$before['revision']]);}
echo "$n comprobaciones aprobadas.\n";
