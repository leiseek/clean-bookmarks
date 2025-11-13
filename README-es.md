# Limpiador de Marcadores - Extensión Chrome
Tienda de complementos de Microsoft Edge: [https://microsoftedge.microsoft.com/addons/detail/bfplmmnmgnfelmjdabmgjpfafnocnhna](https://microsoftedge.microsoft.com/addons/detail/bfplmmnmgnfelmjdabmgjpfafnocnhna)

## Language Selection / Selección de idioma
- [中文(简体)](README.md)
- [English](README-en.md)
- [日本語](README-ja.md)
- [한국어](README-ko.md)
- [Français](README-fr.md)
- [Español](#limpiador-de-marcadores---extensión-chrome)

Una extensión útil para Chrome para verificar y limpiar URLs inaccesibles en los marcadores.

## Características

- 🔍 **Escaneo de Marcadores**: Detecta automáticamente si todas las URL de los marcadores son accesibles
- 📊 **Visualización de Resultados**: Muestra claramente los resultados del escaneo, los enlaces inválidos se marcan con un estilo destacado
- ☑️ **Selección Inteligente**: Selecciona automáticamente los enlaces inválidos, admite selección total y individual
- 💾 **Copia de Seguridad de Datos**: Crea automáticamente una copia de seguridad de los datos actuales de marcadores en el escritorio antes de limpiar
- 🗑️ **Limpieza Segura**: Requiere confirmación secundaria del usuario antes de limpiar para prevenir operaciones erróneas
- 🌐 **Soporte Multilingüe**: Admite chino, inglés, japonés, coreano, francés y español

## Método de Instalación

1. Descargue o clone este proyecto en su computadora
2. Abra el navegador Chrome, vaya a la página de administración de extensiones (`chrome://extensions/`)
3. Active el "Modo de desarrollador" en la esquina superior derecha
4. Haga clic en "Cargar extensión descomprimida"
5. Seleccione la carpeta de este proyecto
6. Instalación completada, puede ver el icono de la extensión en la barra de herramientas del navegador

## Instrucciones de Uso

1. **Escanear Marcadores**
   - Haga clic en el icono de la extensión, haga clic en el botón "Escanear Marcadores" en la ventana emergente
   - Espere a que finalice el escaneo, mostrará el progreso del escaneo y el número de problemas encontrados

2. **Ver Resultados del Escaneo**
   - Una vez finalizado el escaneo, haga clic en el botón "Ver Resultados del Escaneo"
   - Puede ver el estado de todos los marcadores en la página de resultados
   - Los enlaces inválidos se resaltarán con un borde y fondo rojos

3. **Limpiar Enlaces Inválidos**
   - En la página de resultados, los enlaces inválidos se seleccionarán automáticamente
   - Puede desmarcar los enlaces que no desea limpiar
   - Haga clic en el botón "Limpiar Enlaces Seleccionados"
   - Confirme la operación en el cuadro de diálogo de confirmación
   - El sistema primero hará una copia de seguridad de los marcadores actuales en el escritorio, luego limpiará los enlaces inválidos seleccionados

## Descripción de Archivos

- `manifest.json`: Archivo de configuración de la extensión, que define la información básica y los permisos de la extensión
- `background.js`: Script en segundo plano, que maneja la lógica de escaneo y limpieza de datos
- `popup.html/popup.js`: Interfaz de la ventana emergente de la extensión y lógica de interacción
- `results.html/results.js`: Página de visualización de resultados del escaneo y lógica de interacción
- `icons/`: Carpeta de iconos de la extensión (se deben agregar archivos de iconos reales)

## Notas Importantes

1. El primer escaneo puede tomar mucho tiempo, dependiendo del número de URL en los marcadores
2. No cierre la ventana emergente de la extensión durante el escaneo
3. La operación de limpieza creará automáticamente un archivo de copia de seguridad, guardado en el escritorio
4. Algunos sitios web pueden no detectarse con precisión debido a restricciones de políticas de seguridad
5. Se recomienda escanear y limpiar los marcadores periódicamente para mantener la validez de los marcadores

## Método de Recuperación de Marcadores

### Método de Recuperación de Marcadores

La extensión ahora respalda los marcadores en formato HTML, que se puede importar directamente en los navegadores Chrome y Edge.

#### Recuperación de Marcadores en el Navegador Chrome
1. Abra el navegador Chrome, haga clic en el menú de tres puntos en la esquina superior derecha → Marcadores → Administrador de Marcadores
2. En la página del administrador de marcadores, haga clic en el menú de tres puntos en la esquina superior derecha → Importar marcadores y configuración
3. En la ventana de importación emergente, seleccione la opción "Importar desde archivo HTML"
4. Haga clic en el botón "Seleccionar archivo", busque y seleccione el archivo HTML previamente respaldado
5. Haga clic en el botón "Importar" para completar la recuperación

#### Recuperación de Marcadores en el Navegador Edge
1. Abra los favoritos en Edge: presione `Ctrl+Shift+O` o haga clic en el menú de tres puntos en la esquina superior derecha → Favoritos → Administrar favoritos
2. Haga clic en el botón "Importar favoritos" en la esquina superior derecha de la interfaz de favoritos
3. En la ventana de importación emergente, seleccione la opción "Importar desde archivo"
4. Haga clic en el botón "Seleccionar archivo", busque y seleccione el archivo HTML previamente respaldado
5. Haga clic en el botón "Importar" para completar la recuperación

### Ubicación del Archivo de Copia de Seguridad
- De forma predeterminada, los archivos de copia de seguridad se descargarán en su carpeta "Descargas"
- Formato del nombre del archivo: `bookmarks_backup_fecha.html` (ejemplo: `bookmarks_backup_2023-06-15.html`)
- Se recomienda guardar archivos de copia de seguridad importantes en un lugar seguro adicional para evitar pérdidas accidentales

## Implementación Técnica

- Uso de la API Chrome Bookmarks para obtener datos de marcadores
- Uso de la API Fetch para detectar la accesibilidad de URL
- Uso de la API Chrome Downloads para implementar la descarga de archivos de copia de seguridad
- Uso de la API Chrome Storage para almacenar resultados del escaneo
- Diseño de interfaz de usuario responsive, que admite diferentes tamaños de pantalla

## Entorno de Desarrollo

- Navegador Chrome (Manifest V3)
- No se requieren dependencias adicionales ni herramientas de compilación

## Soporte Multilingüe

Esta extensión admite los siguientes idiomas:

- Chino (simplificado)
- Inglés
- Japonés
- Coreano
- Francés
- Español

La extensión cambiará automáticamente el idioma de visualización según la configuración de idioma de su navegador.

## Historial de Versiones
- v1.0: Versión inicial, que incluye escaneo de marcadores, detección de enlaces inválidos, copia de seguridad y limpieza en formato HTML, admite importación y recuperación directas en los navegadores Chrome y Edge, admite internacionalización multilingüe (chino, inglés, japonés, coreano, francés y español)