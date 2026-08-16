# dsh-whale-galgame

[简体中文](README.md) · [English](README.en.md) · [日本語](README.ja.md) · **한국어**

DeepSeek Harness Web에 Galgame 형식의 대화 화면을 추가하는 플러그인입니다. 표시할 캐릭터와 답변에 사용할 모델을 따로 선택할 수 있으며, DeepSeek, Claude, GPT, Gemini, Kimi, Grok의 호감도·기억·대화 기록·CG 도감·사용자 캐릭터 이미지는 캐릭터별로 저장됩니다. 데스크톱 펫과 CG 생성은 선택 기능입니다.

설치되는 플러그인에는 실제로 사용하는 시각 소재 16개가 내장됩니다. 캐릭터 이미지 6개, 배경 1개, 고래 소녀 표정 8개, [dsh-deepseek-girl-pet](https://github.com/f0909172434/dsh-deepseek-girl-pet)에서 가져온 11행 데스크톱 펫 애니메이션 아틀라스 1개입니다. GitHub 공개 소스 저장소는 [`assets/default/`](assets/default/README.md)에 같은 이미지의 개별 내보내기 파일을 제공합니다.

![DSH Web에서 실제로 실행 중인 dsh-whale-galgame](docs/screenshots/galgame-overview.jpg)

> 플러그인 화면은 현재 중국어 간체로 표시됩니다. 이 페이지는 설치 및 사용 문서의 한국어 번역입니다.

## 기능

- 표시할 캐릭터와 답변 모델을 따로 선택합니다. 캐릭터는 작업공간 모델을 따르거나 고정할 수 있고, 답변은 기본 `deepseek-v4-flash`, 작업공간 모델 또는 DSH 모델 목록에서 선택할 수 있습니다.
- 6개 캐릭터의 호감도, 레벨, 기억, 대화 기록, CG 도감, 사용자 캐릭터 이미지 데이터는 각각 분리해 저장됩니다.
- 각 턴에 친밀함, 보통, 거리 두기의 세 가지 답변 후보를 순서를 섞어 표시합니다. 직접 입력도 사용할 수 있습니다.
- 배경, 캐릭터별 이미지, 대화 기록, CG 도감, 데스크톱 펫을 화면에서 관리합니다. 펫을 클릭하면 `galgame` 탭이 열립니다.

## 호감도와 세션 간 컨텍스트

### 관계 진행

각 캐릭터는 Lv.1, 호감도 0에서 시작하며 상태는 서로 분리해 저장됩니다. 친밀함, 보통, 거리 두기 선택지는 각각 +1, 0, -1로 반영되고 위치는 매 턴 바뀌며, 직접 입력은 간단한 키워드 규칙으로 판정합니다. 플러그인이 실행 중일 때, 같은 작업공간에서 새로 발생한 Harness `assistant/message` usage 이벤트로 관측한 입력과 출력 token이 5,000개 누적될 때마다 현재 캐릭터의 호감도가 1 올라갑니다. 한 번에 최대 3까지 반영하고 나머지는 다음 정산으로 이월하며, 플러그인 자체가 시작한 모델 호출은 계산하지 않고 과거 usage도 소급해 다시 계산하지 않습니다. 24시간의 유예 기간이 지난 뒤에도 활동이 없으면 모든 캐릭터의 호감도가 하루에 2씩 줄어들며, 0 아래로는 내려가지 않습니다.

레벨업 기준은 `30 + 15 × (Lv - 1)`, 즉 30, 45, 60……입니다. 기준에 도달하면 레벨이 오르고 초과분은 다음 레벨로 이월되며, 레벨 상한은 없습니다. 관계에 따른 말투는 5단계로 변하고 Lv.5 이후에는 가장 친밀한 단계를 유지합니다. CG 생성을 켜면 레벨업할 때마다 기념 CG 한 장을 생성합니다.

### Harness 작업 이벤트

플러그인은 같은 작업공간에서 최근 72시간 내의 Harness 실시간 및 저장된 최상위 세션을 최대 16개까지 확인하고, 각 세션의 마지막 240개 이벤트만 검사합니다. 로컬의 결정적 규칙으로 작업을 코드 디버깅, 코드 개발, 문서 요약, 문서 작성, 문학 창작, 자료 조사, 데이터 분석, 시각 디자인, 프레젠테이션 작성, 번역·교정 또는 작업 계획으로 분류합니다. 텍스트 분류에는 사람이 명시적으로 제출한 user 본문만 사용합니다. 도구 이름과 턴 종료 상태도 로컬 판정에 쓸 수 있지만, 도구 인자와 실행 결과, assistant 본문은 읽거나 전송하지 않습니다.

Galgame 답변 모델과 CG 생성 서비스에는 미리 정해진 작업 분류와 상태 힌트만 전달합니다. 캐릭터는 현재 화제에 답하면서, 예를 들어 디버깅 작업 뒤에 쉬어 가라고 말하는 식으로 관련된 짧은 관심을 자연스럽게 한 문장 덧붙입니다. 각 캐릭터는 이벤트 지문과 마지막 언급 시간을 따로 저장합니다. 같은 이벤트를 그 캐릭터가 먼저 꺼내는 것은 한 번뿐이고, 다른 이벤트 간에는 최소 30분의 간격을 둡니다. 작업 이벤트는 대화 주제에만 영향을 주며 호감도를 직접 바꾸지 않습니다.

## 포함된 기본 이미지

아래 6개 이미지는 설치 후 각 캐릭터에 적용되는 기본 이미지입니다. GitHub 소스 저장소의 [`assets/default/`](assets/default/README.md)에서 내보낸 파일 16개 전체와 각 용도를 확인할 수 있습니다. npm 설치본은 같은 이미지를 클라이언트 bundle에 내장해 사용하며 원본 내보내기 파일을 한 번 더 포장하지 않습니다.

<table>
  <tr>
    <td align="center"><img src="assets/default/maid-left.webp" width="180" alt="DeepSeek 고래 소녀 기본 이미지"><br><strong>DeepSeek · 고래 소녀</strong></td>
    <td align="center"><img src="assets/default/claude-amber-manuscript-mediator-v5.png" width="180" alt="Claude 모델 소녀 기본 이미지"><br><strong>Claude</strong></td>
    <td align="center"><img src="assets/default/gpt-recursive-weaver-v7.png" width="180" alt="GPT 모델 소녀 기본 이미지"><br><strong>GPT</strong></td>
  </tr>
  <tr>
    <td align="center"><img src="assets/default/gemini-dual-prism-translator-v4.png" width="180" alt="Gemini 모델 소녀 기본 이미지"><br><strong>Gemini</strong></td>
    <td align="center"><img src="assets/default/kimi-lunar-scroll-navigator-v5.png" width="180" alt="Kimi 모델 소녀 기본 이미지"><br><strong>Kimi</strong></td>
    <td align="center"><img src="assets/default/grok-cosmic-signal-ranger-v5.png" width="180" alt="Grok 모델 소녀 기본 이미지"><br><strong>Grok</strong></td>
  </tr>
</table>

나머지 런타임 소재는 심해 궁전 배경 `palace-night.webp`, `whale-*.png` 표정 이미지 8개, 8열 × 11행 애니메이션 아틀라스 `pet-spritesheet.webp`입니다. 앞의 기본 이미지 15개와 펫 아틀라스에는 서로 다른 라이선스가 적용됩니다. 출처, 수정 사항, 파일별 라이선스는 [NOTICE](NOTICE.md)와 [제3자 라이선스 색인](THIRD_PARTY_LICENSES.md)을 확인하세요.

Galgame 레이아웃, 대화 상자, 컨트롤, 장식은 [`src/client/index.ts`](src/client/index.ts)에 공개되어 있으며 비공개 UI 이미지 팩에 의존하지 않습니다.

## 설치

`dsh` 명령과 Web profile을 사용할 수 있는 DeepSeek Harness가 필요합니다.

~~~sh
dsh plugin --profile web add github:JAdpp/dsh-whale-galgame#main
~~~

설치 후 실행 중인 Web profile을 먼저 중지한 다음 다시 시작하세요.

~~~sh
dsh --profile web
~~~

소스 설치에서 `pnpm dsh`를 사용한다면 같은 인수를 유지하면 됩니다.

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

레벨업 CG는 기본적으로 DashScope `qwen-image-3.0`을 사용해 1920 × 1080으로 생성합니다. DashScope key가 없어도 채팅, 캐릭터 전환, 기록, 호감도, 사용자 이미지는 사용할 수 있으며 CG 생성만 비활성화됩니다.

DSH를 시작하는 로컬 환경의 환경 변수로만 key를 제공하세요.

~~~powershell
$env:DASHSCOPE_API_KEY = 'your-local-key'
dsh --profile web
~~~

~~~sh
DASHSCOPE_API_KEY='your-local-key' dsh --profile web
~~~

실제 key를 저장소 파일에 쓰거나 Git에 commit하지 마세요.

## 데이터와 개인정보

실행 데이터는 현재 작업공간 루트의 `.whale-girl-save.json`에 저장됩니다. 캐릭터 상태, 대화 기록, CG, 사용자 배경, 사용자 캐릭터 이미지가 포함될 수 있으므로 개인 데이터로 취급하세요.

- 일반 대화는 DSH에서 선택한 모델 제공자에게 전송됩니다.
- 레벨업 CG를 생성하면 텍스트 프롬프트가 DashScope로 전송됩니다.
- 사용자가 추가한 배경과 캐릭터 이미지는 작업공간 저장 파일에 남으며 위 두 외부 요청에는 포함되지 않습니다.
- Harness 컨텍스트로 저장 파일에 쓰는 것은 원문이 포함되지 않은 이벤트 지문과 마지막 언급 시간뿐입니다. Harness 원문은 저장하지 않고, 외부 요청에는 미리 정해진 분류와 상태 힌트만 포함합니다.
- 현재 세션과 플러그인 저장 파일이 같은 작업공간에 속하지 않으면 Galgame 화면은 캐릭터 상태와 작업 힌트를 읽지 않으며, 작업공간 사이에서 데이터를 재사용하지 않습니다.

이 플러그인 저장소의 `.gitignore`는 다른 작업공간을 자동으로 보호하지 않습니다. 현재 작업공간도 Git 저장소라면 해당 작업공간의 `.gitignore`에 다음을 추가하세요.

~~~gitignore
.whale-girl-save.json
.whale-girl-save.*.json
~~~

## 개발

~~~sh
npm ci
npm run export:art
npm run verify
~~~

바로 설치할 수 있도록 `lib/index.js`와 `lib/client.js`를 저장소에 포함합니다. `src/`를 변경한 뒤 두 파일을 다시 빌드해 commit하세요. `npm run export:art`는 런타임 데이터에서 공개 시각 소재 16개를 내보냅니다.

## 라이선스와 감사

코드, Galgame UI 구현, 문서는 [MIT License](LICENSE.md)를 따릅니다. 캐릭터 이미지 6개, 배경 1개, 고래 소녀 표정 8개로 구성된 기본 이미지 15개는 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)으로 배포합니다. 프로젝트에서 제작한 AI 보조 이미지는 메인테이너가 해당 권리를 보유한 범위에서만 이 라이선스로 제공합니다. `pet-spritesheet.webp`와 [dsh-deepseek-girl-pet](https://github.com/f0909172434/dsh-deepseek-girl-pet)에서 직접 상속한 코드는 업스트림의 MIT 라이선스를 그대로 따릅니다. 파일별 범위는 [NOTICE](NOTICE.md), 보존된 업스트림 라이선스 원문은 [`assets/default/licenses/`](assets/default/licenses/)에서 확인하세요.

마지막으로 구체적인 작품과 구현 지식을 커뮤니티에 공개해 주신 분들께 감사드립니다.

- **上善**은 고래 소녀의 원래 캐릭터 이미지를 만들었습니다: [Pixiv](https://www.pixiv.net/users/62155430) · [Bilibili](https://space.bilibili.com/4456176).
- **ZipZipPipe**는 이 고래 소녀에 DeepSeek 요소를 더해 메이드 고래 소녀로 2차 창작했습니다: [Pixiv](https://www.pixiv.net/users/18604994) · [Bilibili](https://space.bilibili.com/4168597).
- **Small-tailqwq**는 [dsh-deep-whale](https://github.com/Small-tailqwq/dsh-deep-whale)에서 이 플러그인이 사용하는 심해 궁전 배경, 고래 소녀 전신 이미지, Galgame UI 장식과 전체 저작자 표시 계보를 공개했습니다. 이 프로젝트는 해당 소재를 바탕으로 표정 이미지 8개를 추가 제작했습니다.
- **f0909172434 / [dsh-deepseek-girl-pet](https://github.com/f0909172434/dsh-deepseek-girl-pet)**은 DSH용 고래 소녀 데스크톱 펫을 MIT 라이선스로 공개했습니다. 이 플러그인의 펫 기능은 해당 프로젝트를 바탕으로 2차 개발했으며, `pet-spritesheet.webp`는 업스트림 아틀라스와 동일합니다. 이 프로젝트에서는 플러그인 통합 방식과 화면 스타일을 수정하고, 펫을 클릭하면 Galgame 화면이 열리는 동작을 추가했습니다.
- Claude, GPT, Gemini, Kimi, Grok 캐릭터 이미지 5개와 Galgame UI는 이 프로젝트에서 만든 비공식 AI 보조 소재입니다. 해당 기업의 공식 캐릭터, 제휴 또는 보증을 뜻하지 않습니다.

이 오픈소스 소재와 구현이 도움이 되었다면 [dsh-deep-whale](https://github.com/Small-tailqwq/dsh-deep-whale)와 [dsh-deepseek-girl-pet](https://github.com/f0909172434/dsh-deepseek-girl-pet)에 Star를 눌러 주시거나 Pixiv 또는 Bilibili에서 上善과 ZipZipPipe를 팔로우해 주세요. 설치, 실행 또는 호환성 문제는 소재 제작자에게 플러그인 코드를 문의하는 대신 [이 저장소의 Issues](https://github.com/JAdpp/dsh-whale-galgame/issues)에 남겨 주세요.

DeepSeek, Claude, ChatGPT/GPT, Gemini, Kimi, Grok 등의 명칭과 상표는 각 권리자에게 속합니다. 이 프로젝트는 비공식 커뮤니티 플러그인이며 해당 기업과의 제휴, 협력 또는 보증 관계가 없습니다.

## 관련 프로젝트

- [gal-view](https://github.com/Ayase34/gal-view)
- [dsh-galgame](https://github.com/Lanxing6480/dsh-galgame)
- 데스크톱 펫 추천: [dsh-deepseek-girl-pet](https://github.com/f0909172434/dsh-deepseek-girl-pet)

마음에 드는 프로젝트가 있다면 저장소에 Star를 눌러 주세요.
