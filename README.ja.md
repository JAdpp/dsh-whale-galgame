# dsh-whale-galgame

[简体中文](README.md) · [English](README.en.md) · **日本語** · [한국어](README.ko.md)

DeepSeek Harness Web にギャルゲーム形式の会話画面を追加するプラグインです。表示するキャラクターと返信に使うモデルを別々に選べ、好感度・記憶・会話履歴・CG・立ち絵は 6 キャラクターそれぞれに保存されます。デスクトップペットと CG 生成は無効にできます。

![DSH Web で実際に動作している dsh-whale-galgame](docs/screenshots/galgame-overview.png)

_この画像は、デモ会話を使って DSH Web 上で実際に動作させた画面です。API key、ローカルパス、個人の会話履歴は含みません。_

> プラグインの画面表示は現在、簡体字中国語です。このページはインストール方法と使用方法の日本語訳です。

## 機能

- 表示キャラクターと返信モデルを別々に選択できます。キャラクターはワークスペースモデルへの追従または固定、返信は既定の <code>deepseek-v4-flash</code>、ワークスペースへの追従、DSH のモデル一覧から選択できます。
- DeepSeek、Claude、GPT、Gemini、Kimi、Grok の好感度、レベル、記憶、会話履歴、CG 図鑑、立ち絵は分けて保存されます。
- 各ターンに、親密・通常・距離を置く 3 種類の返信候補を順不同で表示します。自由入力も利用できます。
- 背景、キャラクター別立ち絵、会話履歴、CG 図鑑、デスクトップペットを画面から管理できます。ペットをクリックすると <code>galgame</code> タブが開きます。

## インストール

<code>dsh</code> コマンドと Web profile を利用できる DeepSeek Harness が必要です。

~~~sh
dsh plugin --profile web add github:JAdpp/dsh-whale-galgame#main
~~~

インストール後、実行中の Web profile を停止してから再起動します。

~~~sh
dsh --profile web
~~~

ソースからのインストールで <code>pnpm dsh</code> を使う場合も、引数は同じです。

### 更新・削除

~~~sh
dsh plugin --profile web update @dsh-external/dsh-whale-galgame
dsh plugin --profile web remove @dsh-external/dsh-whale-galgame
~~~

どちらも実行後に Web profile を停止し、再起動してください。

## 使用方法と設定

![DSH Web のプラグイン設定画面](docs/screenshots/plugin-settings.png)

Galgame 画面上部で、表示キャラクターと実際の返信モデルを切り替えられます。背景や現在のキャラクターの立ち絵もここからアップロードできます。PNG、JPEG、WebP、AVIF に対応し、ブラウザー側の上限は 1 ファイル 12 MB です。

「設定 → プラグイン → プラグイン設定」では、プラグインの有効・無効、既定キャラクター、既定返信モデルを設定できます。無効にすると Galgame 会話と好感度計算が停止しますが、保存済みデータは削除されません。

## オプションの CG 生成

レベルアップ CG は、既定で DashScope の <code>qwen-image-3.0</code> を使用し、1920 × 1080 で生成します。DashScope key がなくても、チャット、キャラクター切替、履歴、好感度、カスタム画像は利用でき、CG 生成だけが無効になります。

DSH を起動するローカル環境の環境変数でのみ key を設定することを推奨します。

~~~powershell
$env:DASHSCOPE_API_KEY = 'your-local-key'
dsh --profile web
~~~

~~~sh
DASHSCOPE_API_KEY='your-local-key' dsh --profile web
~~~

実際の key をリポジトリ内のファイルに書いたり、Git に commit したりしないでください。

## データとプライバシー

実行時データは、使用中のワークスペース直下にある <code>.whale-girl-save.json</code> に保存されます。キャラクター状態、会話履歴、CG、背景、立ち絵を含む場合があるため、個人データとして扱ってください。

- 通常の会話は、DSH で選択したモデルプロバイダーへ送信されます。
- レベルアップ CG の生成時は、テキストプロンプトが DashScope へ送信されます。
- ユーザーが追加した背景と立ち絵はワークスペースのセーブに保存され、上記の外部リクエストには含まれません。

本プラグインリポジトリの <code>.gitignore</code> は、別のワークスペースを自動では保護しません。使用中のワークスペースも Git リポジトリである場合は、そのワークスペースの <code>.gitignore</code> に次を追加してください。

~~~gitignore
.whale-girl-save.json
.whale-girl-save.*.json
~~~

公開リポジトリには、メンテナーのセーブ、会話履歴、非公開 CG、アップロード画像、ローカル素材集を含めていません。

## 開発

~~~sh
npm ci
npm run prune:art
npm run verify
~~~

そのままインストールできるよう、<code>lib/index.js</code> と <code>lib/client.js</code> をリポジトリに含めています。<code>src/</code> の変更後は両方を再ビルドして commit してください。

## ライセンスとクレジット

コードと文書には [MIT License](LICENSE.md) が適用されます。README の実画面スクリーンショット、および画像内に表示されるキャラクター、背景、その他の素材には、それぞれ元のライセンスが適用されます。出典と詳細は [NOTICE.md](NOTICE.md) を参照してください。

上善、ZipZipPipe、[Small-tailqwq / dsh-deep-whale](https://github.com/Small-tailqwq/dsh-deep-whale)、[@linxin666/dsh-pet（dsh-web-ui）](https://github.com/zhu1090093659/dsh-web-ui) に感謝します。第三者素材を利用または再配布する前に、該当ライセンスを確認し、作者表記を保持してください。

DeepSeek、Claude、ChatGPT/GPT、Gemini、Kimi、Grok などの名称・商標は各権利者に帰属します。本プロジェクトは非公式コミュニティプラグインであり、各社との提携、協力、承認関係はありません。
