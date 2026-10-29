# Publicación de páginas adicionales

Las páginas del portal estaban limitadas a una lista institucional fija. Una página adicional no tenía ruta pública ni enlaces en navegación/búsqueda. El editor tampoco ofrecía el alta normal y mostraba un slug que no correspondía a una dirección pública completa.

Ahora **Páginas institucionales → Nueva página** permite guardar un borrador y publicarlo. La dirección es `#/paginas/slug`; al publicar se incorpora a **Otras Páginas**, al buscador y al mapa del sitio. El sitemap descargable usa el dominio actual y las rutas por hash que sirve este portal. La vista previa permite revisar un borrador sin hacerlo público. Despublicar o enviar una página adicional a la papelera retira sus accesos públicos.

Las páginas institucionales originales conservan sus direcciones y se pueden editar, pero no eliminar ni cambiar de identidad/ruta. El servidor también rechaza estas operaciones, las claves institucionales duplicadas, slugs inválidos y la publicación de contenido vacío.

## Actualizar Hostinger

Respalda y reemplaza estos dos archivos de la rama `dev`, conservando sus rutas:

- `portal-private/views/portal.php`
- `portal-private/Rules.php`

No se requiere importar contenido, ejecutar `actualizar.php` ni cambiar la base de datos o `config.php`. Recarga la intranet sin caché. Una página que ya estuviera guardada con clave no institucional y slug válido puede abrirse mediante `#/paginas/slug`; el menú y buscador la incluyen cuando está publicada.

## Verificación local

Con los servicios locales activos y la base desechable configurada, desde la raíz del repositorio:

```sh
php tests/pages-publication.php
php tests/demo-validation.php
node tests/browser-pages.cjs
node tests/browser-search.cjs
node tests/browser-carousel.cjs
```

Las pruebas de navegador usan Playwright/Chromium y `PISCO_BASE_URL` (por defecto `http://127.0.0.1:8083`). La prueba de páginas necesita la cuenta QA local creada por `tests/parity.php`; crea y retira solo su registro sintético. No se ejecuta contra dominios remotos. Comprueba borrador, vista previa, publicación, enlaces, búsqueda, sitemap, edición de slug, despublicación, papelera y conservación de rutas originales.
