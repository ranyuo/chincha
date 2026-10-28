# Correcciones del informe de Chincha — 28/10/2026

Trabajo en `ranyuo/chincha`, rama `dev`, sobre `8a2132f5f19bc62fc2858bba42d984b5f68d43d4`.
Referencia: informe adjunto de diez páginas; las cinco primeras corresponden a Pisco,
y las cinco del anexo describen Chincha. Se trasladaron cambios por función, sin copiar
el paquete ni la identidad de Pisco.

## Resultado por hallazgo

| Caso | Resultado local | Alcance pendiente |
| --- | --- | --- |
| C01 | Mapa de publicaciones convertido a objeto al inicializar/sincronizar JavaScript y al serializar respuestas PHP. Publicación, recarga, lectura desde alumno y retiro comprobados. | Repetir aceptación en hosting; republicar horarios que se hubieran perdido. |
| C02 | Selector TUPA reúne categorías del catálogo, registro y opciones generales. Guarda y recarga categorías institucionales y personalizadas. | Comprobar con registros reales tras desplegar. |
| C03 | Filtros públicos y administrativos reconocen años, intervalos y «Sin año especificado». No generan «Publ». | Revisión institucional de fechas y vigencias. |
| C04/C05 | Normalización acotada de las dos variantes de categoría y las erratas exactas de 4.1 y 10.6. Actualiza instalaciones existentes y paquete inicial. | Aplicar actualización del hosting sin reimportación. |
| C06 | El PDF conocido se rotula «Temario de admisión 2025 (histórico)». Descarga con SHA-256 igual al archivo local. PDF intacto. | Vincular el prospecto aprobado del proceso actual. |
| C07 | No se habilitó transporte de correo. La prueba de contacto acredita recepción interna. | Configurar SMTP y comprobar entrega externa con buzón controlado. |
| C08 | Presentaciones vacías muestran responsable pendiente; no se inventan autoridades. | Ingresar responsables, cargos y buzones aprobados. |
| C09/C10 | Se preservan catálogos, programas y periodos. Las fixtures QA solo se usan localmente. | Completar catálogos académicos, periodos y documentos oficiales. |
| C11 | Orden natural numérico en listas TUPA pública y administrativa. | Ningún dato tarifario alterado. |
| C12 | Ayuda visible «Obligatorio al publicar»; se conservan borradores sin descripción. Se retiran sugerencias de alumnos demo. | Ninguno para estos textos. |
| C13 | Documentos publicados no se rotulan automáticamente «Vigente». `/assets/chincha/` conserva su procedencia institucional. | Auditoría de aprobación, procedencia y vigencia por documento. |

La normalización no cambia IDs, códigos, montos, cuentas, requisitos, contraseñas o
registros operativos. Las denominaciones personalizadas no se sustituyen. La migración
solo incrementa revisión cuando cambia contenido. Los documentos de Chincha no se
presentan como documentos ajenos por estar en su propia carpeta de assets.

## Evidencia local

Entorno: PHP 8.4, PDO MySQL, sesiones en directorio privado escribible, MariaDB 11.8,
Playwright y Chromium; base desechable `chincha_test`. No se usan credenciales del hosting.

- `tests/run.php`: 31 comprobaciones de servidor.
- `tests/parity.php`: 51 comprobaciones, incluyendo permisos, cruces de horarios y lectura por roles.
- `tests/functional-fixes.php`: 82 comprobaciones, incluyendo conservación de valores y dos actualizaciones consecutivas.
- `tests/browser-functional-fixes.cjs`: 18 comprobaciones de edición TUPA, filtros, temario, descarga y horario entre sesiones.
- `tests/chincha-import.php`: 35 comprobaciones de conservación e importación sobre fixtures locales; no es el procedimiento de despliegue de estas correcciones.
- `tests/browser-search.cjs`: 19 comprobaciones, incluidos varios términos y uso móvil.
- `tests/http-smoke.cjs`: rutas públicas, edición de noticia visible en otra sesión, CSRF, protección de carpeta privada y contacto recibido por administrador; sin errores JavaScript.
- `tests/demo-validation.php`: 270 registros sin errores.
- `tests/demo-content.cjs`: identidad, ocho programas, TUPA y 119 archivos originales con integridad comprobada.

Al instalar PHP se detectó y corrigió la ausencia de almacenamiento de sesiones; las
suites finales de servidor, paridad y regresión se repitieron sin esas advertencias.
No hay proceso de compilación de la aplicación: PHP y los archivos del portal se sirven directamente.

## Estado remoto y actualización

El proxy del entorno respondió HTTP 403 al conectar con `devchincha.aplicacion.io`.
Se guardó ese dominio en el borrador de configuración de red. Esto no demuestra un fallo
del sitio ni aplica la política al entorno actual. No se accedió a la intranet remota,
no se crearon registros QA remotos y no se desplegaron cambios. No hay credenciales ni
ruta de despliegue verificadas en este entorno.

Para desplegar, respaldar archivos y MySQL de desarrollo, revisar el diff y subir solo
los archivos de aplicación indicados en README, incluido el nuevo `Content.php`.
Conservar `config.php`, adjuntos y base existente. Ejecutar `/actualizar.php` con la
clave privada propia **sin importar el contenido institucional**. Repetir la actualización
y los casos de aceptación del informe en desarrollo. El `portal.json` corregido sirve
como paquete inicial; no reemplaza la base del hosting. No publicar fixtures ni cuentas QA.

Se guardaron `install_script` y `start_skill` del entorno y la ubicación del repositorio.
Estos ajustes están en borrador; su publicación y la validación en una tarea nueva siguen
pendientes. Los procesos actuales de MariaDB/PHP no sobreviven necesariamente al reinicio.
