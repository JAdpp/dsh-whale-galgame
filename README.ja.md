# dsh-whale-galgame

![version](https://img.shields.io/badge/version-0.2.0-6fa8dc) ![platform](https://img.shields.io/badge/platform-DSH%20Web-1c9a86) ![license](https://img.shields.io/badge/code-MIT-c8a35f)

[简体中文](README.md) · [English](README.en.md) · **日本語** · [한국어](README.ko.md)

DeepSeek Harness Web 向けのマルチキャラクター Galgame UI と、任意で使えるデスクトップペットです。キャラクターの出典、会話モデル、背景、キャラクター別立ち絵を独立して変更できます。

![Galgame UI イメージ](docs/preview.svg)

> 本プロジェクトは非公式のコミュニティプラグインです。公開版にはプライバシーに配慮した中立的なプレースホルダーのみを収録し、管理者のセーブ、会話履歴、非公開 CG、アップロード画像、ローカル素材集は含みません。

## 主な機能

- **6 人の独立キャラクター**：DeepSeek、Claude、GPT、Gemini、Kimi、Grok の好感度、レベル、記憶、会話履歴、CG 図鑑を分離して保存します。
- **キャラクターとモデルを分離**：ワークスペースモデルへの追従またはキャラクター固定、Flash 既定値・ワークスペース・DSH の利用可能モデルから会話モデルを選択できます。
- **ローカル画像カスタマイズ**：上部バーから Galgame 専用背景と、各キャラクター専用の立ち絵をアップロードできます。
- **Galgame 機能**：多様な返信候補、好感度とレベル、会話履歴、CG 図鑑、任意のレベルアップ記念 CG。
- **任意のデスクトップペット**：クリックで Galgame タブを開き、他のフローティングプラグインと競合する場合は無効にできます。
- **DSH 設定への統合**：「設定 → プラグイン → プラグイン設定」で有効化、キャラクター、会話モデルを変更できます。

![プラグイン設定イメージ](docs/settings.svg)

## クイックインストール

### 必要条件

- `dsh` コマンドを実行できる DeepSeek Harness。
- DSH Web profile。

### GitHub からインストール

```sh
dsh plugin --profile web add github:JAdpp/dsh-whale-galgame#main
```

インストール後に Web profile を再起動してください。各会話のタブに `galgame` が表示されます。

```sh
dsh --profile web
```

Harness のソース checkout から実行している場合は、環境に合わせて `dsh` を `pnpm dsh` に置き換えてください。

### 更新・削除

```sh
dsh plugin --profile web update @dsh-external/dsh-whale-galgame
dsh plugin --profile web remove @dsh-external/dsh-whale-galgame
```

どちらも実行後に Web profile の再起動が必要です。

## 設定

### 上部バー

- **キャラクター出典**：ワークスペースに追従、または一人を固定。
- **実際の会話**：プラグイン既定値、ワークスペース、ほかの利用可能モデルを選択。
- **背景画像**：Galgame 専用背景をプレビュー、適用、置換、初期化。
- **キャラクター立ち絵**：現在のキャラクター専用立ち絵をアップロード、または初期画像へ戻す。

PNG、JPEG、WebP、AVIF に対応し、ブラウザー側の上限は 12 MB です。画像は現在のワークスペースのローカルセーブにだけ保存され、このリポジトリへ送信されません。

### 任意のレベルアップ CG

DashScope key がなくても、チャット、キャラクター切替、履歴、好感度、画像カスタマイズは利用できます。CG 生成だけが無効になります。有効化する場合はローカル DSH プロセスに設定してください。

```powershell
$env:DASHSCOPE_API_KEY = 'your-local-key'
dsh --profile web
```

```sh
DASHSCOPE_API_KEY='your-local-key' dsh --profile web
```

インストール先の `cordis.patch.yml` をローカル編集することもできますが、実キーを commit しないでください。リポジトリの値は常に空です。

## データとプライバシー

![データフロー](docs/architecture.svg)

実行時データはアクティブなワークスペース直下の `.whale-girl-save.json` に保存されます。キャラクター状態、会話履歴、CG、ユーザー背景・立ち絵を含む場合があり、Git の対象外です。

- 通常のポーリングはメタデータだけを返し、大きな画像は必要時に取得します。
- カスタム立ち絵はキャラクター別、背景はワークスペース単位です。
- 無効化すると Galgame 会話と好感度精算を停止し、再有効化用の設定カードは残します。
- 公開ドキュメントとビルドに実ユーザーの履歴は使いません。

## 開発

```sh
npm ci
npm run prune:art
npm run verify
```

GitHub からそのまま導入できるよう、`lib/index.js` と `lib/client.js` を commit します。`src/` 変更後は両 bundle を再ビルドしてください。

## 構成

```text
build/                         DSH Web クライアント用ビルドアダプター
docs/                          プライバシー安全な README 用 SVG
lib/                           インストール可能な host/client bundle
scripts/prune-art.mjs          未使用の内蔵素材を削除
src/index.ts                   状態、モデルルーティング、セーブ、CG、API
src/client/index.ts            Galgame、ペット、設定、アップロード UI
src/client/art.generated.ts    公開版の中立的なプレースホルダー
cordis.patch.yml               key を含まない既定設定
```

## ライセンスと謝辞

ソフトウェア、ドキュメント、中立的な公開プレースホルダーは MIT License です。詳細は [LICENSE.md](LICENSE.md) と [NOTICE.md](NOTICE.md) を参照してください。

創作・技術面で、上善、ZipZipPipe、[Small-tailqwq / dsh-deep-whale](https://github.com/Small-tailqwq/dsh-deep-whale)、[@linxin666/dsh-pet（dsh-web-ui）](https://github.com/zhu1090093659/dsh-web-ui) に感謝します。公開パッケージは各作者の原画像を再配布しません。ローカルで第三者素材を追加する場合は、該当ライセンスと完全なクレジット表記に従ってください。

DeepSeek、Claude、ChatGPT/GPT、Gemini、Kimi、Grok などの名称・商標は各権利者に帰属します。本プロジェクトは各社の公式・提携・推奨プロジェクトではありません。
