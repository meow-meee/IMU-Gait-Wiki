# IMU 步態分析 LLM Wiki

本專案是面向完全沒有基礎的讀者的繁體中文教學 Wiki，涵蓋 IMU 原理、三軸與人體運動方向、步態週期、IMU 資料處理及應用。**目前僅完成專案規則與資料夾骨架，尚未 ingest 原始資料。**

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
│   └── topics/               # 五個單元的 Wiki 文章（待 ingest 後產生）
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

## 下一階段：分批 ingest

1. 先蒐集 3 篇學術論文、2 份官方技術文件，確認可讀且適用。
2. 將首批 1–2 份原始資料放入 `raw/`，請 Coding Agent 遵守 `AGENTS.md` 讀取並整理。
3. 檢查來源紀錄、頁碼、知識點與引用後，更新 Wiki 及 ingest 日誌。
4. 第一批成功後，執行 `git add .` 和 `git commit -m "first ingest"`；其餘資料依序進行。
5. 五份資料完成後才進行 Graph 的證據卡、教學大綱與 HTML 簡報階段。

**注意**：`README.md`、`wiki/index.md` 的單元標題目前只代表規劃，並非已完成驗證的內容。
