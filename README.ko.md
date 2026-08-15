# dsh-whale-galgame

[简体中文](README.md) · [English](README.en.md) · [日本語](README.ja.md) · **한국어**

DeepSeek Harness Web에 Galgame 형식의 대화 화면을 추가하는 플러그인입니다. 화면에 표시할 캐릭터와 답변에 사용할 모델을 따로 선택할 수 있으며, 호감도·기억·대화 기록·CG·캐릭터 이미지는 6개 캐릭터별로 저장됩니다. 데스크톱 펫과 CG 생성은 선택 기능입니다.

![DSH Web에서 실제로 실행 중인 dsh-whale-galgame](docs/screenshots/galgame-overview.png)

_이 이미지는 데모 대화를 사용해 DSH Web에서 실제로 실행한 화면입니다. API key, 로컬 파일 경로, 개인 대화 기록은 포함하지 않습니다._

> 플러그인 화면은 현재 중국어 간체로 표시됩니다. 이 페이지는 설치 및 사용 문서의 한국어 번역입니다.

## 기능

- 표시할 캐릭터와 답변 모델을 따로 선택합니다. 캐릭터는 작업공간 모델을 따르거나 고정할 수 있고, 답변은 기본 <code>deepseek-v4-flash</code>, 작업공간 모델 또는 DSH 모델 목록에서 선택할 수 있습니다.
- DeepSeek, Claude, GPT, Gemini, Kimi, Grok의 호감도, 레벨, 기억, 대화 기록, CG 도감, 캐릭터 이미지는 각각 분리해 저장됩니다.
- 각 턴에 친밀함, 보통, 거리 두기의 세 가지 답변 후보를 순서를 섞어 표시합니다. 직접 입력도 사용할 수 있습니다.
- 배경, 캐릭터별 이미지, 대화 기록, CG 도감, 데스크톱 펫을 화면에서 관리합니다. 펫을 클릭하면 <code>galgame</code> 탭이 열립니다.

## 설치

<code>dsh</code> 명령과 Web profile을 사용할 수 있는 DeepSeek Harness가 필요합니다.

~~~sh
dsh plugin --profile web add github:JAdpp/dsh-whale-galgame#main
~~~

설치 후 실행 중인 Web profile을 먼저 중지한 다음 다시 시작하세요.

~~~sh
dsh --profile web
~~~

소스 설치에서 <code>pnpm dsh</code>를 사용한다면 같은 인수를 유지하면 됩니다.

### 업데이트 및 제거

~~~sh
dsh plugin --profile web update @dsh-external/dsh-whale-galgame
dsh plugin --profile web remove @dsh-external/dsh-whale-galgame
~~~

두 작업 모두 실행 후 Web profile을 중지하고 다시 시작해야 합니다.

## 사용 및 설정

![DSH Web의 플러그인 설정 화면](docs/screenshots/plugin-settings.png)

Galgame 상단 바에서 표시할 캐릭터와 실제 답변 모델을 전환할 수 있습니다. 배경이나 현재 캐릭터의 이미지도 여기서 업로드합니다. PNG, JPEG, WebP, AVIF를 지원하며 브라우저 기준 파일당 제한은 12 MB입니다.

“설정 → 플러그인 → 플러그인 설정”에서 플러그인 사용 여부, 기본 캐릭터, 기본 답변 모델을 지정할 수 있습니다. 플러그인을 끄면 Galgame 대화와 호감도 계산은 멈추지만 저장된 데이터는 삭제되지 않습니다.

## 선택 기능: CG 생성

레벨업 CG는 기본적으로 DashScope <code>qwen-image-3.0</code>을 사용해 1920 × 1080으로 생성합니다. DashScope key가 없어도 채팅, 캐릭터 전환, 기록, 호감도, 사용자 이미지는 사용할 수 있으며 CG 생성만 비활성화됩니다.

DSH를 시작하는 로컬 환경의 환경 변수로만 key를 제공하는 방법을 권장합니다.

~~~powershell
$env:DASHSCOPE_API_KEY = 'your-local-key'
dsh --profile web
~~~

~~~sh
DASHSCOPE_API_KEY='your-local-key' dsh --profile web
~~~

실제 key를 저장소 파일에 쓰거나 Git에 commit하지 마세요.

## 데이터와 개인정보

실행 데이터는 현재 작업공간 루트의 <code>.whale-girl-save.json</code>에 저장됩니다. 캐릭터 상태, 대화 기록, CG, 배경, 캐릭터 이미지가 포함될 수 있으므로 개인 데이터로 취급하세요.

- 일반 대화는 DSH에서 선택한 모델 제공자에게 전송됩니다.
- 레벨업 CG를 생성하면 텍스트 프롬프트가 DashScope로 전송됩니다.
- 사용자가 추가한 배경과 캐릭터 이미지는 작업공간 저장 파일에 남으며 위 두 외부 요청에는 포함되지 않습니다.

이 플러그인 저장소의 <code>.gitignore</code>는 다른 작업공간을 자동으로 보호하지 않습니다. 현재 작업공간도 Git 저장소라면 해당 작업공간의 <code>.gitignore</code>에 다음을 추가하세요.

~~~gitignore
.whale-girl-save.json
.whale-girl-save.*.json
~~~

공개 저장소에는 메인테이너의 저장 파일, 대화 기록, 비공개 CG, 업로드 이미지, 로컬 원본 에셋이 포함되지 않습니다.

## 개발

~~~sh
npm ci
npm run prune:art
npm run verify
~~~

바로 설치할 수 있도록 <code>lib/index.js</code>와 <code>lib/client.js</code>를 저장소에 포함합니다. <code>src/</code>를 변경한 뒤 두 파일을 다시 빌드해 commit하세요.

## 라이선스와 감사

코드와 문서는 [MIT License](LICENSE.md)를 따릅니다. README의 실제 화면 스크린샷과 그 안에 보이는 캐릭터, 배경, 기타 이미지에는 각 원본 라이선스가 적용됩니다. 출처와 자세한 내용은 [NOTICE.md](NOTICE.md)를 확인하세요.

上善, ZipZipPipe, [Small-tailqwq / dsh-deep-whale](https://github.com/Small-tailqwq/dsh-deep-whale), [@linxin666/dsh-pet (dsh-web-ui)](https://github.com/zhu1090093659/dsh-web-ui)에 감사드립니다. 제3자 에셋을 사용하거나 재배포하기 전에 해당 라이선스를 확인하고 원작자 표기를 유지하세요.

DeepSeek, Claude, ChatGPT/GPT, Gemini, Kimi, Grok 등의 명칭과 상표는 각 권리자에게 속합니다. 이 프로젝트는 비공식 커뮤니티 플러그인이며 해당 기업과의 제휴, 협력 또는 보증 관계가 없습니다.
