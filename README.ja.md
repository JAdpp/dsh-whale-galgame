# dsh-whale-galgame

[简体中文](README.md) · [English](README.en.md) · **日本語** · [한국어](README.ko.md)

DeepSeek Harness Web にギャルゲーム形式の会話画面を追加するプラグインです。表示キャラクターと返信に使うモデルを別々に選べ、DeepSeek、Claude、GPT、Gemini、Kimi、Grok の好感度・記憶・会話履歴・CG 図鑑・カスタム立ち絵はキャラクターごとに保存されます。デスクトップペットと CG 生成は無効にできます。

インストールされるプラグインには、実際に使うビジュアル素材 16 点（立ち絵 6 点、背景 1 点、鯨娘の表情 8 点、[dsh-deepseek-girl-pet](https://github.com/f0909172434/dsh-deepseek-girl-pet) 由来の 11 行デスクトップペット用アニメーションアトラス 1 点）が埋め込まれています。GitHub の公開ソースリポジトリでは、同じ画像を [`assets/default/`](assets/default/README.md) から個別に確認できます。

![DSH Web で実際に動作している dsh-whale-galgame](docs/screenshots/galgame-overview.jpg)

> プラグインの画面表示は現在、簡体字中国語です。このページはインストール方法と使用方法の日本語訳です。

## 機能

- 表示キャラクターと返信モデルを別々に選択できます。キャラクターはワークスペースモデルへの追従または固定、返信は既定の `deepseek-v4-flash`、ワークスペースへの追従、DSH のモデル一覧から選択できます。
- 6 キャラクターの好感度、レベル、記憶、会話履歴、CG 図鑑、カスタム立ち絵は分けて保存されます。
- 各ターンに、親密・通常・距離を置く 3 種類の返信候補を順不同で表示します。自由入力も利用できます。
- 背景、キャラクター別立ち絵、会話履歴、CG 図鑑、デスクトップペットを画面から管理できます。ペットをクリックすると `galgame` タブが開きます。

## 好感度とセッション横断コンテキスト

### 関係の進行

各キャラクターは Lv.1、好感度 0 から始まり、状態は個別に保存されます。親密・通常・距離を置くの 3 選択肢はそれぞれ +1、0、-1 として計算され、表示位置はターンごとに入れ替わります。自由入力は簡易なキーワードルールで判定されます。プラグインの実行中に、同じワークスペースで新たに発生した Harness `assistant/message` usage イベントから観測した入力と出力の token が 5,000 個累積するごとに、現在のキャラクターの好感度が 1 増えます。1 回の計算で反映されるのは最大 3 ポイントで、残りは次回以降に持ち越されます。プラグイン自身が開始したモデル呼び出しは集計対象外で、過去の usage をさかのぼって再計算することもありません。24 時間の猶予期間を過ぎて活動がない場合、全キャラクターの好感度が 1 日あたり 2 減少し、0 未満にはなりません。

レベルアップのしきい値は `30 + 15 × (Lv - 1)`、つまり 30、45、60……です。しきい値に達するとレベルが上がり、超過分は次のレベルに持ち越されます。レベルに上限はありません。関係に応じた口調は 5 段階で、Lv.5 以降は最も親密な段階を保ちます。CG 生成が有効な場合、レベルアップごとに記念 CG が 1 枚生成されます。

### Harness タスクイベント

プラグインが確認するのは、同じワークスペースにある過去 72 時間の Harness ライブセッションと保存済みセッションのうち、上位最大 16 セッションです。各セッションの末尾 240 イベントのみを走査します。ローカルの決定的なルールで、タスクをコードのデバッグ、コード開発、文書要約、文書作成、文学創作、資料調査、データ分析、ビジュアルデザイン、プレゼンテーション作成、翻訳・校正、またはタスク計画に分類します。テキストの分類に使うのは、人間のユーザーが明示的に送信した user 本文のみです。ツール名とターン終了時の状態もローカル判定に利用される場合がありますが、ツールの引数と実行結果、assistant 本文は読み込まれず、送信もされません。

Galgame の返信モデルと CG 生成サービスに渡されるのは、固定されたカテゴリと状態のヒントだけです。キャラクターは現在の話題に応じながら、例えばデバッグ後に休息を促すなど、短い気遣いを自然に 1 文加えます。各キャラクターはイベントのフィンガープリントと最終言及時刻を個別に保存します。同じイベントをそのキャラクターが自発的に言及するのは 1 回だけで、別のイベントとの間隔は最低 30 分です。タスクイベントは話題にだけ影響し、好感度を直接増減させません。

## 同梱デフォルト画像

次の 6 点は、インストール後に各キャラクターが使うデフォルト立ち絵です。GitHub ソースリポジトリの [`assets/default/`](assets/default/README.md) で 16 点すべての書き出しファイルと用途を確認できます。npm インストール版は、同じ画像をクライアント bundle に埋め込んで使い、書き出し原画像を重複収録しません。

<table>
  <tr>
    <td align="center"><img src="assets/default/maid-left.webp" width="180" alt="DeepSeek 鯨娘のデフォルト立ち絵"><br><strong>DeepSeek · 鯨娘</strong></td>
    <td align="center"><img src="assets/default/claude-amber-manuscript-mediator-v5.png" width="180" alt="Claude モデル娘のデフォルト立ち絵"><br><strong>Claude</strong></td>
    <td align="center"><img src="assets/default/gpt-recursive-weaver-v7.png" width="180" alt="GPT モデル娘のデフォルト立ち絵"><br><strong>GPT</strong></td>
  </tr>
  <tr>
    <td align="center"><img src="assets/default/gemini-dual-prism-translator-v4.png" width="180" alt="Gemini モデル娘のデフォルト立ち絵"><br><strong>Gemini</strong></td>
    <td align="center"><img src="assets/default/kimi-lunar-scroll-navigator-v5.png" width="180" alt="Kimi モデル娘のデフォルト立ち絵"><br><strong>Kimi</strong></td>
    <td align="center"><img src="assets/default/grok-cosmic-signal-ranger-v5.png" width="180" alt="Grok モデル娘のデフォルト立ち絵"><br><strong>Grok</strong></td>
  </tr>
</table>

残りの実行時素材は、深海宮殿の背景 `palace-night.webp`、8 点の `whale-*.png` 表情画像、8 列 × 11 行のアニメーションアトラス `pet-spritesheet.webp` です。最初のデフォルト画像 15 点とペット用アトラスには別々のライセンスが適用されます。出典、変更内容、ファイルごとのライセンスは [NOTICE](NOTICE.md) と[第三者ライセンス一覧](THIRD_PARTY_LICENSES.md)を参照してください。

Galgame のレイアウト、会話ボックス、操作部品、装飾は [`src/client/index.ts`](src/client/index.ts) で公開され、非公開の UI 画像パックには依存しません。

## インストール

`dsh` コマンドと Web profile を利用できる DeepSeek Harness が必要です。

~~~sh
dsh plugin --profile web add github:JAdpp/dsh-whale-galgame#main
~~~

インストール後、実行中の Web profile を停止してから再起動します。

~~~sh
dsh --profile web
~~~

ソースからのインストールで `pnpm dsh` を使う場合も、引数は同じです。

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

レベルアップ CG は、既定で DashScope の `qwen-image-3.0` を使用し、1920 × 1080 で生成します。DashScope key がなくても、チャット、キャラクター切替、履歴、好感度、カスタム画像は利用でき、CG 生成だけが無効になります。

DSH を起動するローカル環境の環境変数でのみ key を設定してください。

~~~powershell
$env:DASHSCOPE_API_KEY = 'your-local-key'
dsh --profile web
~~~

~~~sh
DASHSCOPE_API_KEY='your-local-key' dsh --profile web
~~~

実際の key をリポジトリ内のファイルに書いたり、Git に commit したりしないでください。

## データとプライバシー

実行時データは、使用中のワークスペース直下にある `.whale-girl-save.json` に保存されます。キャラクター状態、会話履歴、CG、ユーザー背景、ユーザー立ち絵を含む場合があるため、個人データとして扱ってください。

- 通常の会話は、DSH で選択したモデルプロバイダーへ送信されます。
- レベルアップ CG の生成時は、テキストプロンプトが DashScope へ送信されます。
- ユーザーが追加した背景と立ち絵はワークスペースのセーブに保存され、上記の外部リクエストには含まれません。
- Harness コンテキストとしてセーブに書き込まれるのは、原文を含まないイベントフィンガープリントと最終言及時刻だけです。Harness の原文は保存されず、外部リクエストには固定されたカテゴリと状態のヒントだけが含まれます。
- 現在のセッションとプラグインのセーブが同じワークスペースに属さない場合、Galgame 画面はキャラクター状態とタスク情報を読み込まず、ワークスペース間でデータを使い回しません。

本プラグインリポジトリの `.gitignore` は、別のワークスペースを自動では保護しません。使用中のワークスペースも Git リポジトリである場合は、そのワークスペースの `.gitignore` に次を追加してください。

~~~gitignore
.whale-girl-save.json
.whale-girl-save.*.json
~~~

## 開発

~~~sh
npm ci
npm run export:art
npm run verify
~~~

そのままインストールできるよう、`lib/index.js` と `lib/client.js` をリポジトリに含めています。`src/` の変更後は両方を再ビルドして commit してください。`npm run export:art` は実行時データから公開用のビジュアル素材 16 点を書き出します。

## ライセンスとクレジット

コード、Galgame UI の実装、文書には [MIT License](LICENSE.md) が適用されます。立ち絵 6 点、背景 1 点、鯨娘の表情 8 点の計 15 点のデフォルト画像は、[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) で配布します。本プロジェクトが制作した AI 支援画像については、メンテナーが該当する権利を有する範囲でのみ同ライセンスを適用します。`pet-spritesheet.webp` と [dsh-deepseek-girl-pet](https://github.com/f0909172434/dsh-deepseek-girl-pet) から直接継承したコードには、上流の MIT ライセンスを引き続き適用します。ファイルごとの範囲は [NOTICE](NOTICE.md)、保存した上流ライセンス原文は [`assets/default/licenses/`](assets/default/licenses/) を確認してください。

最後に、具体的な作品と実装知識をコミュニティへ公開してくださった皆さまに感謝します。

- **上善**は鯨娘の原初キャラクターを制作しました：[Pixiv](https://www.pixiv.net/users/62155430) · [Bilibili](https://space.bilibili.com/4456176)。
- **ZipZipPipe**はその鯨娘に DeepSeek 要素を加え、メイド鯨娘として二次創作しました：[Pixiv](https://www.pixiv.net/users/18604994) · [Bilibili](https://space.bilibili.com/4168597)。
- **Small-tailqwq**は [dsh-deep-whale](https://github.com/Small-tailqwq/dsh-deep-whale) で、本プラグインが利用する深海宮殿背景、鯨娘立ち絵、Galgame UI 装飾と完全な帰属関係を公開しました。本プロジェクトはそれらを基に、表情画像 8 点を追加制作しました。
- **f0909172434 / [dsh-deepseek-girl-pet](https://github.com/f0909172434/dsh-deepseek-girl-pet)** は、DSH 用の鯨娘デスクトップペットを MIT ライセンスで公開しました。本プラグインのペット機能は同プロジェクトを基に二次開発したもので、`pet-spritesheet.webp` は上流のアトラスと同一です。本プロジェクトではプラグインへの統合方法と表示スタイルを変更し、ペットのクリックで Galgame 画面を開く操作を追加しました。
- Claude、GPT、Gemini、Kimi、Grok の立ち絵 5 点と Galgame UI は、本プロジェクトによる非公式の AI 支援素材です。各社の公式キャラクター、提携、承認を示すものではありません。

これらのオープンソース素材や実装が役立った場合は、[dsh-deep-whale](https://github.com/Small-tailqwq/dsh-deep-whale) と [dsh-deepseek-girl-pet](https://github.com/f0909172434/dsh-deepseek-girl-pet) に Star を付けたり、Pixiv または Bilibili で上善と ZipZipPipe をフォローしたりしていただけるとうれしいです。インストール、動作、互換性の問題は、素材作者ではなく[本リポジトリの Issues](https://github.com/JAdpp/dsh-whale-galgame/issues) へ報告してください。

DeepSeek、Claude、ChatGPT/GPT、Gemini、Kimi、Grok などの名称・商標は各権利者に帰属します。本プロジェクトは非公式コミュニティプラグインであり、各社との提携、協力、承認関係はありません。

## 関連プロジェクト

- [gal-view](https://github.com/Ayase34/gal-view)
- [dsh-galgame](https://github.com/Lanxing6480/dsh-galgame)
- デスクトップペットのおすすめ：[dsh-deepseek-girl-pet](https://github.com/f0909172434/dsh-deepseek-girl-pet)

気に入ったプロジェクトがあれば、ぜひリポジトリに Star を付けてください。
