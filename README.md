# IMU 步態分析 LLM Wiki

本專案是面向完全沒有基礎的讀者的繁體中文教學 Wiki，涵蓋 IMU 原理、三軸與人體運動方向、步態週期、IMU 資料處理及應用。**已分批匯入 5 份來源。** 目前內容與待查證事項見 [Wiki 索引](wiki/index.md)，檢查結果見 [檢查紀錄](reports/check-log.md)。

## 目錄

```text
IMU-Gait-Wiki/
├── AGENTS.md                 # Coding Agent 工作規則
├── README.md                 # 專案說明
├── raw/                      # 原始論文／官方技術文件（留意授權）
├── wiki/
│   ├── index.md              # Wiki 首頁與單元索引
│   ├── sources.md            # 資料來源清單
│   ├── log.md                # 每批 ingest 紀錄
│   └── topics/               # 五個單元的 Wiki 文章
├── cards/                    # 證據卡（待產生）
├── drafts/                   # 逐頁簡報草稿（待產生）
├── reports/
│   └── check-log.md          # 檢查結果與修正紀錄
├── scripts/                   # 後續 lint / 驗證腳本
├── .agents/
│   └── workflows/
│       └── graph.md          # Graph 流程與退回規則
├── outline.md                # 簡報大綱（待 Wiki 完成後產生）
└── deck.html                 # 最終教學簡報（待產生）
```

## 資料來源與本機版本紀錄

來源包含 3 篇學術論文及 2 份官方技術文件，書目、DOI 或官方來源網址見 [來源登錄表](wiki/sources.md)。每批的處理順序與結果見 [匯入日誌](wiki/log.md)。

原始 PDF 保留在本機的 `raw/`，Git 只追蹤該目錄的 `.gitkeep`。HTML 簡報尚未生成。

## GitHub Pages

已生成可直接發布的靜態站點。入口是 `docs/index.html`，從入口開啟 `docs/deck.html`，或直接進入 `docs/wiki/index.html` 瀏覽 Wiki。網站使用相對路徑，可放在 GitHub Pages 的儲存庫子路徑下。

部署時，GitHub Pages 的來源選擇 **Deploy from a branch → main → /docs**。目前僅完成本機準備。此目錄的 `.nojekyll` 讓 Pages 直接提供已生成的 HTML。原始 Markdown、PDF、草稿和報告留在專案目錄，發布來源只選 `/docs`。

資料更新後，可用 Node.js 與 Marked 17.0.5 重新生成頁面。執行 `node scripts/build-pages.mjs`（本機須能解析 `marked` 套件），或另傳入已安裝的 `marked.esm.js` 路徑作為第一個參數。發布時直接提供已生成的檔案，GitHub Pages 不需執行此指令。
