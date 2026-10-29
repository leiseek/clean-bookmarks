# Bookmark Cleaner

Find broken bookmarks in Chrome and Microsoft Edge. Delete the links you confirm only after a full HTML backup has finished downloading.

[简体中文](README.md) · **English** · [日本語](README-ja.md) · [한국어](README-ko.md) · [Français](README-fr.md) · [Español](README-es.md)

[Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/bfplmmnmgnfelmjdabmgjpfafnocnhna) · [Report an issue](https://github.com/leiseek/clean-bookmarks/issues) · [License](LICENSE)

## Features

- Results grouped by folder, with HTTP status codes and reasons for uncertain results.
- Four states: valid, invalid, unknown and skipped. Only confirmed HTTP 404/410 results can be selected for cleanup.
- A full HTML backup before every cleanup, with deletion gated on download completion.
- Scan progress survives closing the popup. Interrupted scans can be restarted.
- Interface translations for Simplified Chinese, English, Japanese, Korean, French and Spanish.
- Plain JavaScript and HTML, with no build step or third-party runtime dependencies.

## Install

Install from [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/bfplmmnmgnfelmjdabmgjpfafnocnhna), or load the source locally. The store release may differ from the main branch.

For local installation, use Chrome 102+ or a recent Edge version supporting the same Manifest V3 APIs:

1. Download and extract this repository, or run `git clone https://github.com/leiseek/clean-bookmarks.git`.
2. Open `chrome://extensions/` or `edge://extensions/`.
3. Enable **Developer mode**, select **Load unpacked**, and choose the folder containing `manifest.json`.

After changing source files, reload the extension and reopen its popup or results page.

## Use

1. Click the extension icon, then **Scan Bookmarks**. You can close and reopen the popup while scanning.
2. Open the results and review each folder. Click a bookmark row to verify the original link.
3. Select invalid candidates individually or use **Select All Invalid Links**. Entering through the popup's cleanup button preselects confirmed invalid candidates.
4. Confirm cleanup. The extension exports all current bookmarks, waits for the backup download to finish, then deletes the selected bookmarks.

The results page also offers an independent full backup.

## Detection rules

| State | Rule | Eligible for cleanup |
| --- | --- | --- |
| Valid | HTTP(S) response is 2xx | No |
| Invalid | HTTP(S) response is 404 or 410 | After selection and confirmation |
| Unknown | Network failure, timeout, 401/403, 429, 5xx, other unexpected or unreadable responses | No |
| Skipped | Non-HTTP(S) protocols such as `chrome:`, `edge:`, `file:`, `javascript:` or `mailto:` | No |

Checks use `HEAD`, falling back to `GET` on 405/501 and cancelling the body after receiving response headers. Each request has a 10-second timeout. Bookmarks are checked sequentially with about 300 ms between entries.

Login requirements, regional restrictions, anti-bot policies and temporary failures can affect results. An error page returning 200 can still appear valid. Verify candidates before deletion. Results from older versions require a new scan before cleanup.

## Backup and restore

Backups use browser-importable Netscape Bookmark HTML, preserving folder hierarchy, titles and URLs. Files go to the browser's configured **download directory**, with a UTC timestamp in names such as `bookmarks_backup_2026-10-29T12-34-56-789Z.html`.

Failed, cancelled or unavailable backups stop cleanup. Bookmark URLs are checked again before deletion to detect edits made during backup.

To restore, open your browser's bookmark manager, choose its HTML bookmark import function and select the backup. Imports usually add to existing bookmarks and can create duplicates.

Deletion is not transactional: an edit or removal error can leave a cleanup partially complete. Check the backup and scan again after an error. Interrupted deletion tasks are not replayed after a worker restart. Interrupted scans restart from the beginning.

## Privacy and permissions

There are no accounts, telemetry or developer-operated backend. Results and task state stay in extension-local browser storage. Scanning directly contacts bookmarked websites, including intranet sites. Those sites and network services can observe the requests. Requests omit browser login cookies, so authenticated pages may remain unknown.

| Permission | Purpose |
| --- | --- |
| `bookmarks` | Read bookmarks and remove links confirmed by the user |
| `storage` | Store results, progress and pending backup tasks |
| `downloads` | Export backups and monitor completion |
| HTTP/HTTPS host access | Check links across bookmarked websites |

Backups contain the full bookmark collection. Store them securely and redact private URLs, credentials and tokens from bug reports.

## Development and contributions

With Node.js 22+, run the dependency-free checks directly:

```bash
npm test
npm run check
```

Tests use Node's built-in test runner, a local HTTP server and mocked Chrome APIs. They cover classification, cancellation, download completion and failure, worker restart, HTML escaping and page state. Also verify changes in a separate browser profile: scan, reopen the popup, cancel a backup, complete cleanup and import the exported HTML with disposable bookmarks.

Report reproducible bugs through [Issues](https://github.com/leiseek/clean-bookmarks/issues), including browser/version, extension version or commit, steps, expected behavior and actual results. Discuss substantial changes first. Pull requests should explain behavior and validation; changes to detection or deletion need regression tests, and new strings should appear in all six locale catalogs.

## License

[Mulan Permissive Software License, Version 2 (MulanPSL-2.0)](LICENSE).
