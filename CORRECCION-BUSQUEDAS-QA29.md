# Búsquedas de egresados y periodos de becas

La revisión remota de chincha.aplicacion.io confirmó dos búsquedas que devolvían cero filas para registros existentes:

- Egresados: buscar el nombre `QA29 Egresados integral 01` no encontraba su ficha.
- Periodos de becas: buscar `2099` no encontraba el periodo de prueba de ese año.

Ambos listados heredaban los campos de búsqueda generales `titulo` y `nombre`, que no corresponden a sus registros. Se configura Egresados para buscar por `nombres` y `anio`, y Periodos de becas por `anio` y `periodo`. También se precisa el texto de ayuda.

Validación: `node tests/browser-registry-search.cjs`, únicamente sobre la instalación local con la base desechable de `tests/parity.php`. Sus ocho comprobaciones crean registros temporales, buscan por nombre/año/periodo, verifican búsquedas sin resultados y limpieza de filtros, y retiran sus registros al finalizar. Sintaxis PHP y validación de JavaScript/assets también aprobadas.

El cambio de aplicación afecta solamente a `portal-private/views/portal.php`. No requiere cambios de base de datos ni configuración. La revisión y las pruebas locales no lo publican automáticamente en Hostinger.
