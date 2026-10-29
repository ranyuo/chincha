# IESTP Chincha — Portal institucional

Sistema PHP/MySQL adaptado con la información pública de **https://www.iestpchincha.edu.pe/**, consultada el **27 de octubre de 2026**. Conserva el diseño, las rutas, los módulos y las funciones del sistema original.

Incluye ocho programas con sus perfiles y mallas publicadas, plana docente y jerárquica, historia, dos sedes, noticias, becas, documentos de gestión y TUPA. Las imágenes y los documentos se sirven desde archivos locales; no se cargan desde el servidor del sitio de origen.

[Mapeo, fuentes y datos pendientes](MAPEO-CHINCHA.md) · [Instalación y operación](INSTRUCCIONES.md) · [Descargar main](https://github.com/ranyuo/chincha/archive/refs/heads/main.zip)

## Instalación nueva

Requiere PHP 8.2 o posterior, PDO MySQL, sesiones, Fileinfo, Zlib y MySQL/MariaDB. No necesita Composer, Node ni compilar archivos en el hosting.

1. Sube `portal-private/` junto a `public_html/`, al mismo nivel. Incluye **todo** `public_html/assets/chincha/` y los archivos ocultos. No subas las carpetas de pruebas ni las evidencias históricas.
2. Copia `portal-private/config.example.php` a `config.php` y configura una base vacía y una `install_key` privada aleatoria. No subas credenciales a GitHub.
3. Abre `/install.php` con HTTPS y crea tu administrador. Se cargará el contenido institucional de Chincha, sin alumnos, empresas, certificados, cuentas ni expedientes ficticios.
4. Comprueba el portal y elimina `install.php`, `actualizar.php` y `recuperar.php` cuando ya no sean necesarios.

## Actualizar una copia de prueba existente

Subir archivos por sí solo **no sustituye el contenido ya guardado en MySQL**.

1. Respalda archivos y base en hPanel. Conserva `portal-private/config.php` y los respaldos privados.
2. Sube las dos carpetas del paquete, incluyendo las nuevas imágenes y publicaciones de `assets/chincha/`.
3. Inicia sesión como administrador en la intranet. Abre `/actualizar.php`, introduce tu `install_key` y marca **«Reemplazar el contenido público de prueba con la información de Chincha»**.
4. La importación crea un respaldo privado y sustituye el contenido público. Conserva cuentas, contraseñas, solicitudes y registros académicos. Las personas y programas anteriores se conservan despublicados para no romper vínculos; los IDs académicos existentes no se reasignan.
5. Comprueba el resultado y elimina `actualizar.php` del hosting. Si no marcas la casilla, el actualizador conserva el contenido anterior.

La importación es una sustitución deliberada del contenido público: respalda primero cualquier edición institucional propia. Los horarios operativos, responsables internos y destinatarios de cada oficina deben configurarse por la institución. El envío de correo sigue deshabilitado como en el sistema original.

[Corrección del buscador y actualización de un solo archivo en Hostinger](CORRECCION-BUSCADOR.md).

## Validación de desarrollo

Usa exclusivamente una base desechable cuyo nombre termine en `_test` y una configuración privada `config.test.php`. Los scripts de pruebas pueden recrear sus tablas.

```sh
node tests/demo-content.cjs
node tests/browser-search.cjs
node tests/browser-carousel.cjs
node tests/browser-pages.cjs
php tests/pages-publication.php
php tests/demo-validation.php
PORTAL_CONFIG_FILE=/ruta/config.test.php php tests/run.php
PORTAL_CONFIG_FILE=/ruta/config.test.php php tests/parity.php
PORTAL_CONFIG_FILE=/ruta/config.test.php php tests/chincha-import.php
PISCO_TEST_CREDENTIALS=/ruta/credenciales-qa.json node tests/browser-chincha.cjs
```

`browser-chincha.cjs` necesita Playwright y Chromium como herramientas externas de desarrollo, una instalación local de pruebas y un archivo privado con la contraseña del administrador QA (`password`; opcionalmente `install_key` para probar el actualizador). Nunca uses credenciales de producción.

`chincha-import.php` se ejecuta después de `parity.php`; verifica respaldo, importación repetible, permisos y conservación de datos operativos. Los informes de calidad y las evidencias de la versión de demostración son históricos; la validación de esta adaptación figura en `MAPEO-CHINCHA.md`.

## Correcciones del informe de Chincha (28/10/2026)

Se corrigieron la persistencia de publicaciones de horarios, las categorías TUPA al editar,
las variantes conocidas de categorías y las erratas 4.1/10.6, los filtros de vigencia por
intervalos y sin año, y el orden natural de códigos. Las ayudas indican qué se exige al
publicar. El archivo conocido de admisión se identifica como **temario histórico de 2025**;
no sustituye el prospecto aprobado del proceso actual. Los documentos de gestión muestran
su estado de publicación sin equipararlo a vigencia legal.

Para una instalación existente: respalda archivos y MySQL; sube `Content.php`, `Schema.php`,
`Portal.php`, `bootstrap.php` y `views/portal.php` en `portal-private/`. Conserva `config.php`
y los adjuntos. Ejecuta `/actualizar.php` con la clave privada de esa instalación y **sin
marcar la importación del contenido de Chincha**. La versión 5 normaliza únicamente los
textos conocidos; conserva IDs, montos, cuentas y datos operativos. Repetir la actualización
no vuelve a incrementar la revisión si no hay cambios. Un horario perdido debe publicarse
nuevamente. No copies datos o cuentas QA al hosting.

Regresión adicional, exclusivamente con la base desechable `_test` y el servidor local
configurado con el mismo `PORTAL_CONFIG_FILE`:

```sh
PORTAL_CONFIG_FILE=/ruta/config.test.php php tests/parity.php
PORTAL_CONFIG_FILE=/ruta/config.test.php php tests/functional-fixes.php
PISCO_BASE_URL=http://127.0.0.1:8083 node tests/browser-functional-fixes.cjs
```

La prueba de navegador utiliza las cuentas sintéticas creadas por `parity.php` y modifica
la base de pruebas. Detalle de cobertura, pendientes y despliegue: [CORRECCIONES-INFORME.md](CORRECCIONES-INFORME.md).
