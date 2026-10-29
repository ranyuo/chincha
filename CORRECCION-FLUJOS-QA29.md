# Correcciones de los flujos de empresa, postulación y horarios

Las pruebas QA29 con sesiones separadas confirmaron tres problemas:

1. El enlace `?registro=1` no seleccionaba el registro público de empresas. Al seleccionar «Para empresas», el cambio de la pestaña interna también podía reconstruir la página con la pestaña exterior anterior. Ahora se admite el enlace existente y se conserva la pestaña elegida en la URL.
2. Los identificadores académicos se calculaban como máximo local + 1. Una empresa o alumno solo recibe sus registros; dos perfiles podían generar el mismo ID. El servidor rechazaba correctamente la colisión, bloqueando la segunda oferta o postulación. Ahora se generan identificadores aleatorios de 52 bits, enteros seguros en JavaScript/PHP, comprobando además los registros visibles. El servidor conserva sus restricciones de identidad y ámbito.
3. El horario personal del docente y las exportaciones omitían el turno de tarde. Se muestran y exportan los turnos que tengan clases; la vista por ambientes usa también todos los turnos.

## Actualización de Hostinger

Respaldar y reemplazar **solo `portal-private/views/portal.php`** por el archivo de esta rama. No ejecutar instaladores, importaciones ni `actualizar.php`; no cambiar la base o `config.php`.

Las cuentas y horarios QA29 registrados en el sitio se conservan. Tras subir el archivo, recargar la página sin caché y repetir la creación de oferta de la segunda empresa, la postulación del segundo alumno y la grilla del docente de tarde.

## Pruebas locales

Usar únicamente la base desechable `_test` y `config.test.php`. Preparar los perfiles con `tests/parity.php`, que recrea sus tablas. Con PHP/MariaDB locales activos y Playwright/Chromium:

```sh
PORTAL_CONFIG_FILE=/ruta/config.test.php php tests/parity.php
node tests/academic-identifiers.cjs
node tests/browser-community-regressions.cjs
node tests/browser-scoped-job-flow.cjs
node tests/browser-carousel.cjs
node tests/browser-pages.cjs
```

`browser-scoped-job-flow.cjs` crea dos empresas y ofertas, permite postular a dos alumnos desde sesiones separadas, actualiza la evaluación desde cada empresa y verifica que el alumno vea el resultado. Desactiva sus cuentas y retira sus registros auxiliares al finalizar. Las pruebas rechazan destinos remotos.

Estas verificaciones locales no significan que la corrección ya esté instalada en el sitio publicado.
