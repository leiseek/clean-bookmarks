# Bookmarks Cleaner - Chrome Extension
Microsoft Edge Add-ons Store: [https://microsoftedge.microsoft.com/addons/detail/bfplmmnmgnfelmjdabmgjpfafnocnhna](https://microsoftedge.microsoft.com/addons/detail/bfplmmnmgnfelmjdabmgjpfafnocnhna)

## Language Selection / 语言选择
- [中文(简体)](README.md)
- [English](#bookmarks-cleaner---chrome-extension)
- [日本語](README-ja.md)
- [한국어](README-ko.md)
- [Français](README-fr.md)
- [Español](README-es.md)

A useful Chrome extension for checking and cleaning inaccessible URLs in bookmarks.

## Features

- 🔍 **Bookmark Scanning**: Automatically detects if all URLs in bookmarks are accessible
- 📊 **Result Display**: Clearly shows scan results, invalid links are marked with a醒目 style
- ☑️ **Smart Selection**: Automatically selects invalid links, supports batch and individual selection
- 💾 **Data Backup**: Automatically backs up current bookmark data to desktop before cleaning
- 🗑️ **Safe Cleaning**: Requires user's secondary confirmation before cleaning to prevent mishandling
- 🌐 **Multilingual Support**: Supports Chinese, English, Japanese, Korean, French and Spanish

## Installation Method

1. Download or clone this project to your computer
2. Open Chrome browser, go to extensions management page (`chrome://extensions/`)
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked"
5. Select the folder of this project
6. Installation completed, you can see the extension icon in the browser toolbar

## Usage Method

1. **Scan Bookmarks**
   - Click on the extension icon, click the "Scan Bookmarks" button in the popup window
   - Wait for the scan to complete, it will display the scan progress and the number of problems found

2. **View Scan Results**
   - After the scan is complete, click the "View Scan Results" button
   - You can see the status of all bookmarks on the results page
   - Invalid links will be highlighted with a red border and background

3. **Clean Invalid Links**
   - On the results page, invalid links will be automatically selected
   - You can uncheck the links you don't want to clean
   - Click the "Clean Selected Links" button
   - Confirm the operation in the confirmation dialog box
   - The system will first back up the current bookmarks to the desktop, then clean the selected invalid links

## File Description

- `manifest.json`: Extension configuration file, defining the basic information and permissions of the extension
- `background.js`: Background script, handling data scanning and cleaning logic
- `popup.html/popup.js`: Extension popup window interface and interaction logic
- `results.html/results.js`: Scan results display page and interaction logic
- `icons/`: Extension icon folder (need to add actual icon files)

## Notes

1. The first scan may take some time, depending on the number of URLs in the bookmarks
2. Please do not close the extension popup window during scanning
3. The cleaning operation will automatically create a backup file, saved on the desktop
4. Some websites may not be detected accurately due to security policy restrictions
5. It is recommended to scan and clean bookmarks regularly to maintain the validity of bookmarks

## Bookmark Recovery Method

### Bookmark Recovery Method

The extension now backs up bookmarks in HTML format, which can be directly imported by Chrome and Edge browsers.

#### Chrome Browser Bookmark Recovery
1. Open Chrome browser, click the three dots menu in the top right corner → Bookmarks → Bookmark Manager
2. On the Bookmark Manager page, click the three dots menu in the top right corner → Import bookmarks and settings
3. In the pop-up import window, select the "Import from HTML file" option
4. Click the "Choose File" button, find and select the previously backed up HTML file
5. Click the "Import" button to complete the recovery

#### Edge Browser Bookmark Recovery
1. Open favorites in Edge: press `Ctrl+Shift+O` or click the three dots menu in the top right corner → Favorites → Manage favorites
2. Click the "Import favorites" button in the top right corner of the favorites interface
3. In the pop-up import window, select the "Import from file" option
4. Click the "Choose file" button, find and select the previously backed up HTML file
5. Click the "Import" button to complete the recovery

### Backup File Location
- By default, backup files will be downloaded to your "Downloads" folder
- File naming format: `bookmarks_backup_date.html` (example: `bookmarks_backup_2023-06-15.html`)
- It is recommended to additionally save important backup files in a safe location to prevent accidental loss

## Technical Implementation

- Using Chrome Bookmarks API to get bookmark data
- Using Fetch API to detect URL accessibility
- Using Chrome Downloads API to implement backup file download
- Using Chrome Storage API to store scan results
- Responsive UI design, supporting different screen sizes

## Development Environment

- Chrome browser (Manifest V3)
- No additional dependencies or build tools required

## Multilingual Support

This extension supports the following languages:

- Chinese (Simplified)
- English
- Japanese
- Korean
- French
- Spanish

The extension will automatically switch the display language according to the browser's language settings.

## Version History
- v1.0: Initial version, including bookmark scanning, invalid link detection, HTML format backup and cleaning functions, supporting direct import and recovery in Chrome and Edge browsers, supporting multilingual internationalization (Chinese, English, Japanese, Korean, French and Spanish)