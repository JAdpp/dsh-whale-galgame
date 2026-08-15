# dsh-whale-galgame

[简体中文](README.md) · [English](README.en.md) · **日本語** · [한국어](README.ko.md)

DeepSeek Harness Web にギャルゲーム形式の会話画面を追加するプラグインです。表示キャラクターと返信に使うモデルを別々に選べ、DeepSeek、Claude、GPT、Gemini、Kimi、Grok の好感度・記憶・会話履歴・CG 図鑑・カスタム立ち絵はキャラクターごとに保存されます。デスクトップペットと CG 生成は無効にできます。

インストールされるプラグインには、実際に使うデフォルト画像 16 点（立ち絵 6 点、背景 1 点、鯨娘の表情 8 点、11 行のデスクトップペット用アニメーションアトラス 1 点）が埋め込まれています。GitHub の公開ソースリポジトリでは、同じ画像を [`assets/default/`](assets/default/README.md) から個別に確認でき、公開用の代替プレースホルダーは使っていません。

![DSH Web で実際に動作している dsh-whale-galgame](docs/screenshots/galgame-overview.png)

_この画像は、デモ会話を使って DSH Web 上で実際に動作させた画面です。API key、ローカルパス、個人の会話履歴は含みません。_

> プラグインの画面表示は現在、簡体字中国語です。このページはインストール方法と使用方法の日本語訳です。

## 機能

- 表示キャラクターと返信モデルを別々に選択できます。キャラクターはワークスペースモデルへの追従または固定、返信は既定の `deepseek-v4-flash`、ワークスペースへの追従、DSH のモデル一覧から選択できます。
- 6 キャラクターの好感度、レベル、記憶、会話履歴、CG 図鑑、カスタム立ち絵は分けて保存されます。
- 各ターンに、親密・通常・距離を置く 3 種類の返信候補を順不同で表示します。自由入力も利用できます。
- 背景、キャラクター別立ち絵、会話履歴、CG 図鑑、デスクトップペットを画面から管理できます。ペットをクリックすると `galgame` タブが開きます。

## 同梱デフォルト画像

次の 6 点は、インストール後に各キャラクターが使う実際のデフォルト立ち絵で、README 用の mockup ではありません。GitHub ソースリポジトリの [`assets/default/`](assets/default/README.md) で 16 点すべての書き出しファイルと用途を確認できます。npm インストール版は、同じ画像をクライアント bundle に埋め込んで使い、書き出し原画像を重複収録しません。

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

残りのデフォルト画像は、深海宮殿の背景 `palace-night.webp`、8 点の `whale-*.png` 表情画像、8 列 × 11 行のアニメーションアトラス `pet-spritesheet.webp` です。出典、変更内容、ファイルごとのライセンスは [NOTICE](NOTICE.md) と[第三者ライセンス一覧](THIRD_PARTY_LICENSES.md)を参照してください。

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

本プラグインリポジトリの `.gitignore` は、別のワークスペースを自動では保護しません。使用中のワークスペースも Git リポジトリである場合は、そのワークスペースの `.gitignore` に次を追加してください。

~~~gitignore
.whale-girl-save.json
.whale-girl-save.*.json
~~~

公開リポジトリに含まれるのは、プラグインと一緒に配布するデフォルト画像だけです。メンテナーまたはユーザーのセーブ、会話履歴、生成 CG、アップロード背景、アップロード立ち絵、API key、非公開素材集は含みません。

## 開発

~~~sh
npm ci
npm run export:art
npm run verify
~~~

そのままインストールできるよう、`lib/index.js` と `lib/client.js` をリポジトリに含めています。`src/` の変更後は両方を再ビルドして commit してください。`npm run export:art` は実行時データから公開用のデフォルト画像 16 点を書き出します。

## ライセンスとクレジット

コード、Galgame UI の実装、文書には [MIT License](LICENSE.md) が適用されます。同梱するデフォルト画像 16 点は [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) で配布します。本プロジェクトが制作した AI 支援画像については、メンテナーが該当する権利を有する範囲でのみ同ライセンスを適用します。ファイルごとの範囲は [NOTICE](NOTICE.md)、保存した上流ライセンス原文は [`assets/default/licenses/`](assets/default/licenses/) を確認してください。

最後に、具体的な作品と実装知識をコミュニティへ公開してくださった皆さまに感謝します。

- **上善**は鯨娘の原初キャラクターを制作しました：[Pixiv](https://www.pixiv.net/users/62155430) · [Bilibili](https://space.bilibili.com/4456176)。
- **ZipZipPipe**はその鯨娘に DeepSeek 要素を加え、メイド鯨娘として二次創作しました：[Pixiv](https://www.pixiv.net/users/18604994) · [Bilibili](https://space.bilibili.com/4168597)。
- **Small-tailqwq**は [dsh-deep-whale](https://github.com/Small-tailqwq/dsh-deep-whale) で、本プラグインが利用する深海宮殿背景、鯨娘立ち絵、Galgame UI 装飾と完全な帰属関係を公開しました。本プロジェクトはそれらを基に、表情画像 8 点と 11 行のデスクトップペット用アニメーションアトラス 1 点を追加制作しました。
- [dsh-web-ui](https://github.com/zhu1090093659/dsh-web-ui) に収録されている **@linxin666/dsh-pet** は、ペット状態アニメーション、クリック操作、DSH 接続の実装参考です。現在の鯨娘ペット用アトラスは本プロジェクトが制作したもので、`dsh-pet` から提供された画像ではありません。
- **Craybreeding / [Hatch Pet](https://github.com/Craybreeding/hatch-pet)** は、Codex v2 用 8 × 11 ペットアトラスの生成・検証・パッケージ化ワークフローを公開しました。本プロジェクトは鯨娘アトラスの構成と確認にその手順を利用しましたが、Hatch Pet のサンプル動物画像は使用していません。
- Claude、GPT、Gemini、Kimi、Grok の立ち絵 5 点と Galgame UI は、本プロジェクトによる非公式の AI 支援素材です。各社の公式キャラクター、提携、承認を示すものではありません。

これらのオープンソース素材や実装が役立った場合は、[dsh-deep-whale](https://github.com/Small-tailqwq/dsh-deep-whale)、[dsh-web-ui](https://github.com/zhu1090093659/dsh-web-ui)、[Hatch Pet](https://github.com/Craybreeding/hatch-pet) に Star を付けたり、Pixiv または Bilibili で上善と ZipZipPipe をフォローしたりしていただけるとうれしいです。インストール、動作、互換性の問題は、素材作者ではなく[本リポジトリの Issues](https://github.com/JAdpp/dsh-whale-galgame/issues) へ報告してください。

DeepSeek、Claude、ChatGPT/GPT、Gemini、Kimi、Grok などの名称・商標は各権利者に帰属します。本プロジェクトは非公式コミュニティプラグインであり、各社との提携、協力、承認関係はありません。
