# 納税者価値追跡ダッシュボード (Taxpayer Value Tracking Dashboard)

政策データを可視化し、税金の価値を最大化しているかを追跡するためのダッシュボードアプリケーションです。

## 概要

このダッシュボードは、日本の政策実施状況とその成果を透明性高く可視化し、政策の効率性と有効性を評価するためのツールです。税金が効果的に使われているかという核心的な問いに答えるために、データドリブンな分析と洞察を提供します。

## 主要機能

### 1. 投資と成果の関係性分析
- 散布図による予算規模と達成率の関係性の可視化
- 予算規模の大きい事業の改善機会分析
- データに基づく洞察の自動生成

### 2. 効果発現プロセス分析
- 政策実施から成果創出までの各段階の進捗状況の可視化
- 分野別のプロセス特性比較
- プロセス効率に関する洞察の提供

### 3. 継続的改善の取り組み
- 改善サイクルの進捗状況と成熟度の可視化
- 長期的取り組み事業のトラッキング
- 年度間の改善傾向分析

### 4. 予算執行プロセスの特性
- 契約方式の特性分析
- 階層的な予算執行パターンの可視化
- 透明性の高い契約執行に関する洞察の提供

## デザイン原則

- **中立的な表現**: 評価を含む表現を避け、データの特性や差異を客観的に示します
- **文脈の提供**: 単純な数値ではなく、比較基準や背景情報を伴わせて表示します
- **セミ・ダイナミックな洞察**: データに基づいて適切な洞察テンプレートを選択する仕組みを実装しています
- **バランスの取れた視点**: データ報告者（行政組織）と利用者（納税者）双方にとって有益な情報提供を目指しています

## 技術スタック

- React
- Ant Design
- Nivo / Recharts (データ可視化)
- React Router DOM
- lodash
- papaparse (CSV解析)

## 開発環境のセットアップ

```bash
# リポジトリのクローン
git clone https://github.com/username/rss_dashboard.git
cd rss_dashboard/policy-dashboard

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm start
```

## データソース

ダッシュボードは以下のCSVファイルからデータを読み込みます：

- `1-2_RS_2024_基本情報_事業概要等.csv`: 基本的な事業情報
- `3-1_RS_2024_効果発現経路_目標・実績.csv`: 目標と実績のデータ
- `3-2_RS_2024_効果発現経路_目標のつながり.csv`: 目標間の関連性
- `4-1_RS_2024_点検・評価.csv`: 評価結果
- `5-1_RS_2024_支出先_支出情報.csv`: 支出情報

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。