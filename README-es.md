# Limpiador de marcadores

Comprueba enlaces de marcadores en Chrome y Microsoft Edge. Los enlaces seleccionados y confirmados se eliminan después de completar la descarga de una copia HTML de todos los marcadores.

[简体中文](README.md) · [English](README-en.md) · [日本語](README-ja.md) · [한국어](README-ko.md) · [Français](README-fr.md) · **Español**

## Instalación

Instala desde [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/bfplmmnmgnfelmjdabmgjpfafnocnhna) o carga el código fuente. La versión de la tienda puede ser diferente de la rama principal.

La instalación local requiere Chrome 102+ o un Edge reciente compatible con las mismas API de Manifest V3. Descarga el repositorio, abre `chrome://extensions/` o `edge://extensions/`, activa el modo de desarrollador y carga la extensión descomprimida seleccionando la carpeta que contiene `manifest.json`. No requiere compilación.

## Uso y clasificación

1. Inicia el análisis desde el icono de la extensión. Puedes cerrar la ventana emergente y volver a abrirla durante el análisis.
2. Revisa los resultados por carpeta. Haz clic en una fila para comprobar el enlace original.
3. Selecciona los candidatos inválidos y confirma la limpieza. Primero se guardará una copia completa de los marcadores.

| Estado | Regla | Se puede eliminar |
| --- | --- | --- |
| Válido | Respuesta HTTP(S) 2xx | No |
| Inválido | Respuesta HTTP(S) 404/410 | Tras seleccionar y confirmar |
| Sin confirmar | Error de red, tiempo agotado, 401/403, 429, 5xx, etc. | No |
| Omitido | Protocolos `chrome:`, `edge:`, `file:`, `javascript:`, etc. | No |

El inicio de sesión, las restricciones regionales y los fallos temporales pueden afectar los resultados. Comprueba los enlaces antes de eliminarlos. Los resultados antiguos requieren otro análisis. Los análisis interrumpidos pueden reiniciarse desde el principio.

## Copia y restauración

Las copias HTML se guardan en la **carpeta de descargas configurada en el navegador**. Si la descarga falla o se cancela, no se eliminan marcadores. También puedes crear una copia independiente desde la página de resultados.

Para restaurar, utiliza la importación HTML del administrador de marcadores del navegador. La importación suele añadir elementos a los existentes y puede crear duplicados. Un error durante la eliminación puede dejar una limpieza parcial, sin revertir automáticamente lo ya eliminado. Revisa la copia y vuelve a analizar.

## Privacidad y contribuciones

No hay cuentas, telemetría ni servidor del desarrollador. Los resultados y tareas se guardan en el almacenamiento local de la extensión. El análisis contacta directamente con los sitios marcados, sin cookies de inicio de sesión. Guarda las copias de forma segura y elimina las URL privadas y los tokens de los informes de errores.

Con Node.js 22+, ejecuta `npm test` y `npm run check`, sin dependencias externas. Verifica la eliminación y restauración en un perfil separado del navegador. Se agradecen los [informes de errores](https://github.com/leiseek/clean-bookmarks/issues), traducciones y contribuciones.

Consulta el [README en inglés](README-en.md) para más detalles. Licencia: [MulanPSL-2.0](LICENSE).
