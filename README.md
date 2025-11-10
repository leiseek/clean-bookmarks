# 收藏夹清理 - Chrome插件
 微软Edge插件商店地址： [https://microsoftedge.microsoft.com/addons/detail/bfplmmnmgnfelmjdabmgjpfafnocnhna](https://microsoftedge.microsoft.com/addons/detail/bfplmmnmgnfelmjdabmgjpfafnocnhna)

## 语言选择 / Language Selection
- [中文(简体)](#收藏夹清理---chrome插件)
- [English](#bookmark-cleaner---chrome-extension)
- [日本語](#ブックマーククリーナー---chrome拡張機能)
- [한국어](#북마크-클리너---chrome-확장-프로그램)
- [Français](#nettoyeur-de-favoris---extension-chrome)
- [Español](#limpiador-de-marcadores---extensión-chrome)

一个实用的Chrome插件，用于检查并清理收藏夹中无法访问的网址。

## 功能特点

- 🔍 **扫描收藏夹**: 自动检测所有收藏夹中的网址是否可正常访问
- 📊 **结果展示**: 清晰展示扫描结果，失效链接用醒目样式标注
- ☑️ **智能选择**: 自动勾选失效链接，支持全选和单选
- 💾 **数据备份**: 清理前自动备份当前收藏夹数据到桌面
- 🗑️ **安全清理**: 需要用户二次确认后才进行清理，防止误操作
- 🌐 **多语言支持**: 支持中文、英语、日语、韩语、法语和西班牙语

## 安装方法

1. 下载或克隆本项目到本地
2. 打开Chrome浏览器，进入扩展程序管理页面 (`chrome://extensions/`)
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择本项目文件夹
6. 插件安装完成，可以在浏览器工具栏看到插件图标

## 使用方法

1. **扫描收藏夹**
   - 点击插件图标，在弹出窗口中点击"扫描收藏夹"按钮
   - 等待扫描完成，会显示扫描进度和发现的问题数量

2. **查看扫描结果**
   - 扫描完成后，点击"查看扫描结果"按钮
   - 在结果页面中可以看到所有书签的状态
   - 失效链接会以红色边框和背景高亮显示

3. **清理失效链接**
   - 在结果页面中，失效链接会自动被勾选
   - 可以取消勾选不想清理的链接
   - 点击"清理选中链接"按钮
   - 在确认对话框中确认操作
   - 系统会先备份当前收藏夹到桌面，然后清理选中的失效链接

## 文件说明

- `manifest.json`: 插件配置文件，定义插件的基本信息和权限
- `background.js`: 后台脚本，处理数据扫描和清理逻辑
- `popup.html/popup.js`: 插件弹出窗口界面和交互逻辑
- `results.html/results.js`: 扫描结果展示页面和交互逻辑
- `icons/`: 插件图标文件夹（需要添加实际图标文件）

## 注意事项

1. 首次扫描可能需要较长时间，取决于收藏夹中的网址数量
2. 扫描过程中请不要关闭插件弹出窗口
3. 清理操作会自动创建备份文件，保存在桌面
4. 某些网站可能由于安全策略限制无法准确检测状态
5. 建议定期扫描和清理收藏夹，保持书签的有效性

## 书签恢复方法

### 书签恢复方法

插件现在将书签备份为HTML格式，这种格式可以直接被Chrome和Edge浏览器导入。

#### Chrome浏览器恢复书签
1. 打开Chrome浏览器，点击右上角的三点菜单 → 书签 → 书签管理器
2. 在书签管理器页面，点击右上角的三点菜单 → 导入书签和设置
3. 在弹出的导入窗口中，选择「从HTML文件导入」选项
4. 点击「选择文件」按钮，找到并选择之前备份的HTML文件
5. 点击「导入」按钮完成恢复

#### Edge浏览器恢复书签
1. 在Edge中打开收藏夹：按 `Ctrl+Shift+O` 或点击右上角三点菜单 → 收藏夹 → 管理收藏夹
2. 点击收藏夹界面右上角的「导入收藏夹」按钮
3. 在弹出的导入窗口中，选择「从文件导入」选项
4. 点击「选择文件」按钮，找到并选择之前备份的HTML文件
5. 点击「导入」按钮完成恢复

### 备份文件位置
- 默认情况下，备份文件会下载到您的「下载」文件夹
- 文件名格式：`bookmarks_backup_日期.html`（例如：`bookmarks_backup_2023-06-15.html`）
- 建议将重要的备份文件另外保存到安全位置，防止意外丢失

## 技术实现

- 使用Chrome Bookmarks API获取收藏夹数据
- 使用Fetch API检测网址可访问性
- 使用Chrome Downloads API实现备份文件下载
- 使用Chrome Storage API存储扫描结果
- 响应式UI设计，支持不同尺寸屏幕

## 开发环境

- Chrome浏览器 (Manifest V3)
- 无需额外依赖或构建工具

## 多语言支持

本插件支持以下语言：

- 中文（简体）
- 英语
- 日语
- 韩语
- 法语
- 西班牙语

插件会根据您的浏览器语言设置自动切换显示语言。

## 版本历史
- v1.0: 初始版本，包含书签扫描、失效链接检测、HTML格式备份和清理功能，支持Chrome和Edge浏览器直接导入恢复，支持多语言国际化（中文、英语、日语、韩语、法语和西班牙语）

---

# Bookmark Cleaner - Chrome Extension

A practical Chrome extension for checking and cleaning inaccessible URLs in bookmarks.

## Features

- 🔍 **Scan Bookmarks**: Automatically detect if all URLs in bookmarks are accessible
- 📊 **Result Display**: Clearly show scan results, invalid links marked with prominent style
- ☑️ **Smart Selection**: Automatically select invalid links, support select all and single selection
- 💾 **Data Backup**: Automatically backup current bookmark data to desktop before cleaning
- 🗑️ **Safe Cleaning**: Requires user's secondary confirmation before cleaning to prevent misoperation
- 🌐 **Multi-language Support**: Support Chinese, English, Japanese, Korean, French and Spanish

## Installation Method

1. Download or clone this project to local
2. Open Chrome browser, go to extensions management page (`chrome://extensions/`)
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked"
5. Select this project folder
6. Installation completed, you can see the extension icon in browser toolbar

## Usage

1. **Scan Bookmarks**
   - Click the extension icon, click "Scan Bookmarks" button in the popup window
   - Wait for scanning to complete, it will show scanning progress and number of issues found

2. **View Scan Results**
   - After scanning is complete, click "View Scan Results" button
   - You can see the status of all bookmarks in the results page
   - Invalid links will be highlighted with red border and background

3. **Clean Invalid Links**
   - In the results page, invalid links will be automatically selected
   - You can uncheck links you don't want to clean
   - Click "Clean Selected Links" button
   - Confirm operation in the confirmation dialog
   - The system will first backup current bookmarks to desktop, then clean selected invalid links

## File Description

- `manifest.json`: Extension configuration file, defining basic information and permissions of the extension
- `background.js`: Background script, handling data scanning and cleaning logic
- `popup.html/popup.js`: Extension popup window interface and interaction logic
- `results.html/results.js`: Scan results display page and interaction logic
- `icons/`: Extension icon folder (need to add actual icon files)

## Notes

1. The first scan may take a long time, depending on the number of URLs in bookmarks
2. Please do not close the extension popup window during scanning
3. Cleaning operation will automatically create a backup file, saved on desktop
4. Some websites may not be accurately detected due to security policy restrictions
5. It is recommended to regularly scan and clean bookmarks to maintain the validity of bookmarks

## Bookmark Recovery Method

### Bookmark Recovery Method

The extension now backs up bookmarks in HTML format, which can be directly imported by Chrome and Edge browsers.

#### Chrome Browser Recovery
1. Open Chrome browser, click the three-dot menu in the top right corner → Bookmarks → Bookmark Manager
2. In the bookmark manager page, click the three-dot menu in the top right corner → Import bookmarks and settings
3. In the pop-up import window, select the "Import from HTML file" option
4. Click the "Choose File" button, find and select the previously backed up HTML file
5. Click the "Import" button to complete recovery

#### Edge Browser Recovery
1. Open favorites in Edge: press `Ctrl+Shift+O` or click the three-dot menu in the top right corner → Favorites → Manage favorites
2. Click the "Import favorites" button in the top right corner of the favorites interface
3. In the pop-up import window, select the "Import from file" option
4. Click the "Choose File" button, find and select the previously backed up HTML file
5. Click the "Import" button to complete recovery

### Backup File Location
- By default, backup files will be downloaded to your "Downloads" folder
- File name format: `bookmarks_backup_date.html` (e.g.: `bookmarks_backup_2023-06-15.html`)
- It is recommended to additionally save important backup files to a safe location to prevent accidental loss

## Technical Implementation

- Use Chrome Bookmarks API to get bookmark data
- Use Fetch API to detect URL accessibility
- Use Chrome Downloads API to implement backup file download
- Use Chrome Storage API to store scan results
- Responsive UI design, supporting different screen sizes

## Development Environment

- Chrome browser (Manifest V3)
- No additional dependencies or build tools required

## Multi-language Support

This extension supports the following languages:

- Chinese (Simplified)
- English
- Japanese
- Korean
- French
- Spanish

The extension will automatically switch the display language according to your browser language settings.

## Version History
- v1.0: Initial version, including bookmark scanning, invalid link detection, HTML format backup and cleaning functions, supporting direct import and recovery in Chrome and Edge browsers, supporting multi-language internationalization (Chinese, English, Japanese, Korean, French and Spanish)

---

# ブックマーククリーナー - Chrome拡張機能

ブックマーク内のアクセス不能なURLをチェックしてクリーンアップするための便利なChrome拡張機能です。

## 主な機能

- 🔍 **ブックマークスキャン**: すべてのブックマークURLが正常にアクセス可能か自動検出
- 📊 **結果表示**: スキャン結果を明確に表示し、無効なリンクは目立つスタイルでマーク
- ☑️ **スマート選択**: 無効なリンクを自動的にチェック、全選択と単一選択をサポート
- 💾 **データバックアップ**: クリーンアップ前に現在のブックマークデータをデスクトップに自動バックアップ
- 🗑️ **安全なクリーンアップ**: 誤操作を防ぐため、ユーザーの二次確認が必要
- 🌐 **多言語サポート**: 中国語、英語、日本語、韓国語、フランス語、スペイン語をサポート

## インストール方法

1. このプロジェクトをダウンロードまたはクローンしてローカルに保存
2. Chromeブラウザを開き、拡張機能管理ページにアクセス (`chrome://extensions/`)
3. 右上隅の「デベロッパーモード」を有効にする
4. 「パッケージ化されていない拡張機能を読み込む」をクリック
5. このプロジェクトのフォルダを選択
6. インストール完了、ブラウザのツールバーに拡張機能アイコンが表示されます

## 使用方法

1. **ブックマークのスキャン**
   - 拡張機能アイコンをクリックし、ポップアップウィンドウで「ブックマークをスキャン」ボタンをクリック
   - スキャンが完了するまで待ち、スキャンの進捗状況と見つかった問題の数が表示されます

2. **スキャン結果の表示**
   - スキャンが完了したら、「スキャン結果を表示」ボタンをクリック
   - 結果ページですべてのブックマークの状態を確認できます
   - 無効なリンクは赤い枠線と背景で強調表示されます

3. **無効なリンクのクリーンアップ**
   - 結果ページでは、無効なリンクが自動的にチェックされます
   - クリーンアップしたくないリンクのチェックを外すことができます
   - 「選択したリンクをクリーンアップ」ボタンをクリック
   - 確認ダイアログで操作を確認
   - システムはまず現在のブックマークをデスクトップにバックアップし、次に選択した無効なリンクをクリーンアップします

## ファイル説明

- `manifest.json`: 拡張機能の設定ファイルで、拡張機能の基本情報とアクセス許可を定義
- `background.js`: バックグラウンドスクリプトで、データのスキャンとクリーンアップのロジックを処理
- `popup.html/popup.js`: 拡張機能のポップアップウィンドウインターフェースとインタラクションロジック
- `results.html/results.js`: スキャン結果表示ページとインタラクションロジック
- `icons/`: 拡張機能アイコンフォルダ（実際のアイコンファイルを追加する必要があります）

## 注意事項

1. 最初のスキャンには、ブックマーク内のURLの数によって長時間かかる場合があります
2. スキャン中は拡張機能のポップアップウィンドウを閉じないでください
3. クリーンアップ操作により、デスクトップにバックアップファイルが自動的に作成されます
4. セキュリティポリシーの制限により、一部のウェブサイトの状態を正確に検出できない場合があります
5. ブックマークの有効性を維持するために、定期的にスキャンとクリーンアップを行うことをお勧めします

## ブックマーク回復方法

### ブックマーク回復方法

拡張機能は現在、ChromeとEdgeブラウザで直接インポートできるHTML形式でブックマークをバックアップします。

#### Chromeブラウザでのブックマーク回復
1. Chromeブラウザを開き、右上隅の三点メニューをクリック → ブックマーク → ブックマークマネージャー
2. ブックマークマネージャーページで、右上隅の三点メニューをクリック → ブックマークと設定をインポート
3. ポップアップ表示されたインポートウィンドウで、「HTMLファイルからインポート」オプションを選択
4. 「ファイルを選択」ボタンをクリックし、以前にバックアップしたHTMLファイルを見つけて選択
5. 「インポート」ボタンをクリックして回復を完了

#### Edgeブラウザでのブックマーク回復
1. Edgeでお気に入りを開く：`Ctrl+Shift+O` を押すか、右上隅の三点メニューをクリック → お気に入り → お気に入りの管理
2. お気に入りインターフェースの右上隅にある「お気に入りをインポート」ボタンをクリック
3. ポップアップ表示されたインポートウィンドウで、「ファイルからインポート」オプションを選択
4. 「ファイルを選択」ボタンをクリックし、以前にバックアップしたHTMLファイルを見つけて選択
5. 「インポート」ボタンをクリックして回復を完了

### バックアップファイルの場所
- デフォルトでは、バックアップファイルは「ダウンロード」フォルダにダウンロードされます
- ファイル名形式：`bookmarks_backup_日付.html`（例：`bookmarks_backup_2023-06-15.html`）
- 重要なバックアップファイルを予期しない損失を防ぐために、安全な場所に追加で保存することをお勧めします

## 技術実装

- Chrome Bookmarks APIを使用してブックマークデータを取得
- Fetch APIを使用してURLのアクセス可能性を検出
- Chrome Downloads APIを使用してバックアップファイルのダウンロードを実装
- Chrome Storage APIを使用してスキャン結果を保存
- レスポンシブUIデザイン、異なる画面サイズをサポート

## 開発環境

- Chromeブラウザ（Manifest V3）
- 追加の依存関係やビルドツールは不要

## 多言語サポート

この拡張機能は以下の言語をサポートしています：

- 中国語（簡体字）
- 英語
- 日本語
- 韓国語
- フランス語
- スペイン語

拡張機能は、ブラウザの言語設定に応じて自動的に表示言語を切り替えます。

## バージョン履歴
- v1.0: 初期バージョン、ブックマークスキャン、無効なリンク検出、HTML形式のバックアップとクリーンアップ機能を含み、ChromeとEdgeブラウザでの直接インポートと回復をサポート、多言語国際化（中国語、英語、日本語、韓国語、フランス語、スペイン語）をサポート

---

# 북마크 클리너 - Chrome 확장 프로그램

북마크에서 접근할 수 없는 URL을 확인하고 정리하는 데 유용한 Chrome 확장 프로그램입니다.

## 기능 특징

- 🔍 **북마크 스캔**: 모든 북마크 URL이 정상적으로 접근 가능한지 자동 검출
- 📊 **결과 표시**: 스캔 결과를 명확히 표시하고, 유효하지 않은 링크는 눈에 띄는 스타일로 표시
- ☑️ **스마트 선택**: 유효하지 않은 링크를 자동으로 선택하고, 전체 선택 및 개별 선택을 지원
- 💾 **데이터 백업**: 정리하기 전에 현재 북마크 데이터를 바탕화면으로 자동 백업
- 🗑️ **안전한 정리**: 잘못된 작업을 방지하기 위해 사용자의 이차 확인이 필요
- 🌐 **다국어 지원**: 중국어, 영어, 일본어, 한국어, 프랑스어, 스페인어를 지원

## 설치 방법

1. 이 프로젝트를 다운로드하거나 클론하여 로컬에 저장
2. Chrome 브라우저를 열고, 확장 프로그램 관리 페이지에 접속 (`chrome://extensions/`)
3. 오른쪽 상단의 "개발자 모드"를 활성화
4. "압축 해제된 확장 프로그램 로드"를 클릭
5. 이 프로젝트 폴더를 선택
6. 설치가 완료되면 브라우저 도구 모음에 확장 프로그램 아이콘이 표시됩니다

## 사용 방법

1. **북마크 스캔**
   - 확장 프로그램 아이콘을 클릭하고, 팝업 창에서 "북마크 스캔" 버튼을 클릭
   - 스캔이 완료될 때까지 기다리면 스캔 진행 상황과 발견된 문제 수가 표시됩니다

2. **스캔 결과 보기**
   - 스캔이 완료되면 "스캔 결과 보기" 버튼을 클릭
   - 결과 페이지에서 모든 북마크의 상태를 확인할 수 있습니다
   - 유효하지 않은 링크는 빨간색 테두리와 배경으로 강조 표시됩니다

3. **유효하지 않은 링크 정리**
   - 결과 페이지에서 유효하지 않은 링크는 자동으로 선택됩니다
   - 정리하고 싶지 않은 링크의 선택을 해제할 수 있습니다
   - "선택한 링크 정리" 버튼을 클릭
   - 확인 대화 상자에서 작업을 확인
   - 시스템은 먼저 현재 북마크를 바탕화면으로 백업한 다음 선택한 유효하지 않은 링크를 정리합니다

## 파일 설명

- `manifest.json`: 확장 프로그램 구성 파일로, 확장 프로그램의 기본 정보와 권한을 정의
- `background.js`: 백그라운드 스크립트로, 데이터 스캔 및 정리 로직을 처리
- `popup.html/popup.js`: 확장 프로그램 팝업 창 인터페이스 및 상호 작용 로직
- `results.html/results.js`: 스캔 결과 표시 페이지 및 상호 작용 로직
- `icons/`: 확장 프로그램 아이콘 폴더 (실제 아이콘 파일을 추가해야 함)

## 주의 사항

1. 첫 번째 스캔은 북마크에 있는 URL 수에 따라 시간이 오래 걸릴 수 있습니다
2. 스캔 중에는 확장 프로그램 팝업 창을 닫지 마십시오
3. 정리 작업은 바탕화면에 백업 파일을 자동으로 생성합니다
4. 보안 정책 제한으로 인해 일부 웹사이트의 상태를 정확하게 감지할 수 없는 경우가 있습니다
5. 북마크의 유효성을 유지하려면 정기적으로 스캔하고 정리하는 것이 좋습니다

## 북마크 복구 방법

### 북마크 복구 방법

확장 프로그램은 현재 Chrome 및 Edge 브라우저에서 직접 가져올 수 있는 HTML 형식으로 북마크를 백업합니다.

#### Chrome 브라우저 북마크 복구
1. Chrome 브라우저를 열고 오른쪽 상단의 세 개 점 메뉴를 클릭 → 북마크 → 북마크 관리자
2. 북마크 관리자 페이지에서 오른쪽 상단의 세 개 점 메뉴를 클릭 → 북마크 및 설정 가져오기
3. 팝업되는 가져오기 창에서 "HTML 파일에서 가져오기" 옵션을 선택
4. "파일 선택" 버튼을 클릭하고 이전에 백업한 HTML 파일을 찾아 선택
5. "가져오기" 버튼을 클릭하여 복구를 완료

#### Edge 브라우저 북마크 복구
1. Edge에서 즐겨찾기를 엽니다: `Ctrl+Shift+O`를 누르거나 오른쪽 상단의 세 개 점 메뉴를 클릭 → 즐겨찾기 → 즐겨찾기 관리
2. 즐겨찾기 인터페이스 오른쪽 상단의 "즐겨찾기 가져오기" 버튼을 클릭
3. 팝업되는 가져오기 창에서 "파일에서 가져오기" 옵션을 선택
4. "파일 선택" 버튼을 클릭하고 이전에 백업한 HTML 파일을 찾아 선택
5. "가져오기" 버튼을 클릭하여 복구를 완료

### 백업 파일 위치
- 기본적으로 백업 파일은 "다운로드" 폴더에 다운로드됩니다
- 파일 이름 형식: `bookmarks_backup_날짜.html` (예: `bookmarks_backup_2023-06-15.html`)
- 예기치 않은 손실을 방지하기 위해 중요한 백업 파일을 추가로 안전한 위치에 저장하는 것이 좋습니다

## 기술 구현

- Chrome Bookmarks API를 사용하여 북마크 데이터 가져오기
- Fetch API를 사용하여 URL 접근 가능성 감지
- Chrome Downloads API를 사용하여 백업 파일 다운로드 구현
- Chrome Storage API를 사용하여 스캔 결과 저장
- 반응형 UI 디자인으로 다양한 화면 크기 지원

## 개발 환경

- Chrome 브라우저 (Manifest V3)
- 추가적인 종속성이나 빌드 도구가 필요하지 않음

## 다국어 지원

이 확장 프로그램은 다음 언어를 지원합니다:

- 중국어(간체)
- 영어
- 일본어
- 한국어
- 프랑스어
- 스페인어

확장 프로그램은 브라우저의 언어 설정에 따라 자동으로 표시 언어를 전환합니다.

## 버전 기록
- v1.0: 초기 버전, 북마크 스캔, 유효하지 않은 링크 감지, HTML 형식 백업 및 정리 기능 포함, Chrome 및 Edge 브라우저에서 직접 가져오기 및 복구 지원, 다국어 국제화(중국어, 영어, 일본어, 한국어, 프랑스어, 스페인어) 지원

---

# Nettoyeur de favoris - Extension Chrome

Une extension Chrome pratique pour vérifier et nettoyer les URL inaccessibles dans les favoris.

## Fonctionnalités

- 🔍 **Scan des favoris**: Détecte automatiquement si toutes les URL des favoris sont accessibles
- 📊 **Affichage des résultats**: Affiche clairement les résultats du scan, les liens invalides sont marqués avec un style visible
- ☑️ **Sélection intelligente**: Sélectionne automatiquement les liens invalides, prend en charge la sélection multiple et simple
- 💾 **Sauvegarde des données**: Sauvegarde automatiquement les données actuelles des favoris sur le bureau avant le nettoyage
- 🗑️ **Nettoyage sûr**: Nécessite une confirmation secondaire de l'utilisateur avant le nettoyage pour éviter les erreurs
- 🌐 **Support multilingue**: Support du chinois, de l'anglais, du japonais, du coréen, du français et de l'espagnol

## Méthode d'installation

1. Téléchargez ou clonez ce projet sur votre ordinateur
2. Ouvrez le navigateur Chrome, accédez à la page de gestion des extensions (`chrome://extensions/`)
3. Activez le "Mode développeur" en haut à droite
4. Cliquez sur "Charger l'extension non empaquetée"
5. Sélectionnez le dossier de ce projet
6. Installation terminée, vous pouvez voir l'icône de l'extension dans la barre d'outils du navigateur

## Mode d'emploi

1. **Scanner les favoris**
   - Cliquez sur l'icône de l'extension, cliquez sur le bouton "Scanner les favoris" dans la fenêtre contextuelle
   - Attendez la fin du scan, il affichera la progression du scan et le nombre de problèmes détectés

2. **Voir les résultats du scan**
   - Une fois le scan terminé, cliquez sur le bouton "Voir les résultats du scan"
   - Vous pouvez voir l'état de tous les favoris dans la page de résultats
   - Les liens invalides seront mis en évidence avec une bordure et un arrière-plan rouges

3. **Nettoyer les liens invalides**
   - Dans la page de résultats, les liens invalides seront automatiquement sélectionnés
   - Vous pouvez décocher les liens que vous ne souhaitez pas nettoyer
   - Cliquez sur le bouton "Nettoyer les liens sélectionnés"
   - Confirmez l'opération dans la boîte de dialogue de confirmation
   - Le système sauvegardera d'abord les favoris actuels sur le bureau, puis nettoiera les liens invalides sélectionnés

## Description des fichiers

- `manifest.json`: Fichier de configuration de l'extension, définissant les informations de base et les autorisations de l'extension
- `background.js`: Script en arrière-plan, traitant la logique de scan et de nettoyage des données
- `popup.html/popup.js`: Interface de la fenêtre contextuelle de l'extension et logique d'interaction
- `results.html/results.js`: Page d'affichage des résultats du scan et logique d'interaction
- `icons/`: Dossier des icônes de l'extension (il faut ajouter des fichiers d'icônes réels)

## Remarques

1. Le premier scan peut prendre un certain temps, en fonction du nombre d'URL dans les favoris
2. Veuillez ne pas fermer la fenêtre contextuelle de l'extension pendant le scan
3. L'opération de nettoyage créera automatiquement un fichier de sauvegarde, enregistré sur le bureau
4. Certains sites Web peuvent ne pas être détectés avec précision en raison de restrictions de politique de sécurité
5. Il est recommandé de scanner et de nettoyer régulièrement les favoris pour maintenir la validité des marque-pages

## Méthode de récupération des favoris

### Méthode de récupération des favoris

L'extension sauvegarde maintenant les favoris au format HTML, qui peut être directement importé par les navigateurs Chrome et Edge.

#### Récupération des favoris sur le navigateur Chrome
1. Ouvrez le navigateur Chrome, cliquez sur le menu à trois points en haut à droite → Favoris → Gestionnaire de favoris
2. Sur la page du gestionnaire de favoris, cliquez sur le menu à trois points en haut à droite → Importer des favoris et des paramètres
3. Dans la fenêtre d'importation qui s'ouvre, sélectionnez l'option "Importer à partir d'un fichier HTML"
4. Cliquez sur le bouton "Choisir un fichier", recherchez et sélectionnez le fichier HTML sauvegardé précédemment
5. Cliquez sur le bouton "Importer" pour terminer la récupération

#### Récupération des favoris sur le navigateur Edge
1. Ouvrez les favoris dans Edge : appuyez sur `Ctrl+Shift+O` ou cliquez sur le menu à trois points en haut à droite → Favoris → Gérer les favoris
2. Cliquez sur le bouton "Importer des favoris" en haut à droite de l'interface des favoris
3. Dans la fenêtre d'importation qui s'ouvre, sélectionnez l'option "Importer à partir d'un fichier"
4. Cliquez sur le bouton "Choisir un fichier", recherchez et sélectionnez le fichier HTML sauvegardé précédemment
5. Cliquez sur le bouton "Importer" pour terminer la récupération

### Emplacement du fichier de sauvegarde
- Par défaut, les fichiers de sauvegarde seront téléchargés dans votre dossier "Téléchargements"
- Format du nom de fichier : `bookmarks_backup_date.html` (exemple : `bookmarks_backup_2023-06-15.html`)
- Il est recommandé de sauvegarder en plus les fichiers de sauvegarde importants dans un endroit sûr pour éviter une perte accidentelle

## Implémentation technique

- Utilisation de l'API Chrome Bookmarks pour récupérer les données des favoris
- Utilisation de l'API Fetch pour détecter l'accessibilité des URL
- Utilisation de l'API Chrome Downloads pour implémenter le téléchargement de fichiers de sauvegarde
- Utilisation de l'API Chrome Storage pour stocker les résultats du scan
- Conception d'interface utilisateur responsive, prenant en charge différentes tailles d'écran

## Environnement de développement

- Navigateur Chrome (Manifest V3)
- Aucune dépendance supplémentaire ou outil de build requis

## Support multilingue

Cette extension prend en charge les langues suivantes :

- Chinois (simplifié)
- Anglais
- Japonais
- Coréen
- Français
- Espagnol

L'extension passera automatiquement à la langue d'affichage selon les paramètres linguistiques de votre navigateur.

## Historique des versions
- v1.0: Version initiale, comprenant le scan de favoris, la détection de liens invalides, la sauvegarde et le nettoyage au format HTML, prenant en charge l'importation et la récupération directe dans les navigateurs Chrome et Edge, prenant en charge l'internationalisation multilingue (chinois, anglais, japonais, coréen, français et espagnol)

---

# Limpiador de Marcadores - Extensión Chrome

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