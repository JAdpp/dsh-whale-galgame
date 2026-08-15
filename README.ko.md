# dsh-whale-galgame

[简体中文](README.md) · [English](README.en.md) · [日本語](README.ja.md) · **한국어**

DeepSeek Harness Web에 Galgame 형식의 대화 화면을 추가하는 플러그인입니다. 표시할 캐릭터와 답변에 사용할 모델을 따로 선택할 수 있으며, DeepSeek, Claude, GPT, Gemini, Kimi, Grok의 호감도·기억·대화 기록·CG 도감·사용자 캐릭터 이미지는 캐릭터별로 저장됩니다. 데스크톱 펫과 CG 생성은 선택 기능입니다.

설치되는 플러그인에는 실제로 사용하는 기본 이미지 16개가 내장됩니다. 캐릭터 이미지 6개, 배경 1개, 고래 소녀 표정 8개, 11행 데스크톱 펫 애니메이션 아틀라스 1개입니다. GitHub 공개 소스 저장소는 [`assets/default/`](assets/default/README.md)에 같은 이미지의 개별 내보내기 파일을 제공하며, 공개판을 위한 별도 자리표시자 세트를 사용하지 않습니다.

![DSH Web에서 실제로 실행 중인 dsh-whale-galgame](docs/screenshots/galgame-overview.png)

_이 이미지는 데모 대화를 사용해 DSH Web에서 실제로 실행한 화면입니다. API key, 로컬 파일 경로, 개인 대화 기록은 포함하지 않습니다._

> 플러그인 화면은 현재 중국어 간체로 표시됩니다. 이 페이지는 설치 및 사용 문서의 한국어 번역입니다.

## 기능

- 표시할 캐릭터와 답변 모델을 따로 선택합니다. 캐릭터는 작업공간 모델을 따르거나 고정할 수 있고, 답변은 기본 `deepseek-v4-flash`, 작업공간 모델 또는 DSH 모델 목록에서 선택할 수 있습니다.
- 6개 캐릭터의 호감도, 레벨, 기억, 대화 기록, CG 도감, 사용자 캐릭터 이미지 데이터는 각각 분리해 저장됩니다.
- 각 턴에 친밀함, 보통, 거리 두기의 세 가지 답변 후보를 순서를 섞어 표시합니다. 직접 입력도 사용할 수 있습니다.
- 배경, 캐릭터별 이미지, 대화 기록, CG 도감, 데스크톱 펫을 화면에서 관리합니다. 펫을 클릭하면 `galgame` 탭이 열립니다.

## 포함된 기본 이미지

아래 6개 이미지는 설치 후 각 캐릭터에 실제로 적용되는 기본 이미지이며 README용 mockup이 아닙니다. GitHub 소스 저장소의 [`assets/default/`](assets/default/README.md)에서 내보낸 파일 16개 전체와 각 용도를 확인할 수 있습니다. npm 설치본은 같은 이미지를 클라이언트 bundle에 내장해 사용하며 원본 내보내기 파일을 한 번 더 포장하지 않습니다.

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

나머지 기본 이미지는 심해 궁전 배경 `palace-night.webp`, `whale-*.png` 표정 이미지 8개, 8열 × 11행 애니메이션 아틀라스 `pet-spritesheet.webp`입니다. 출처, 수정 사항, 파일별 라이선스는 [NOTICE](NOTICE.md)와 [제3자 라이선스 색인](THIRD_PARTY_LICENSES.md)을 확인하세요.

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

이 플러그인 저장소의 `.gitignore`는 다른 작업공간을 자동으로 보호하지 않습니다. 현재 작업공간도 Git 저장소라면 해당 작업공간의 `.gitignore`에 다음을 추가하세요.

~~~gitignore
.whale-girl-save.json
.whale-girl-save.*.json
~~~

공개 저장소에는 플러그인과 함께 배포되는 기본 이미지만 포함됩니다. 메인테이너 또는 사용자의 저장 파일, 대화 기록, 생성 CG, 업로드 배경, 업로드 캐릭터 이미지, API key, 비공개 원본 에셋 모음은 포함되지 않습니다.

## 개발

~~~sh
npm ci
npm run export:art
npm run verify
~~~

바로 설치할 수 있도록 `lib/index.js`와 `lib/client.js`를 저장소에 포함합니다. `src/`를 변경한 뒤 두 파일을 다시 빌드해 commit하세요. `npm run export:art`는 런타임 데이터에서 공개 기본 이미지 16개를 내보냅니다.

## 라이선스와 감사

코드, Galgame UI 구현, 문서는 [MIT License](LICENSE.md)를 따릅니다. 포함된 기본 이미지 16개는 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)으로 배포합니다. 프로젝트에서 제작한 AI 보조 이미지는 메인테이너가 해당 권리를 보유한 범위에서만 이 라이선스로 제공합니다. 파일별 범위는 [NOTICE](NOTICE.md), 보존된 업스트림 라이선스 원문은 [`assets/default/licenses/`](assets/default/licenses/)에서 확인하세요.

마지막으로 구체적인 작품과 구현 지식을 커뮤니티에 공개해 주신 분들께 감사드립니다.

- **上善**은 고래 소녀의 원래 캐릭터 이미지를 만들었습니다: [Pixiv](https://www.pixiv.net/users/62155430) · [Bilibili](https://space.bilibili.com/4456176).
- **ZipZipPipe**는 이 고래 소녀에 DeepSeek 요소를 더해 메이드 고래 소녀로 2차 창작했습니다: [Pixiv](https://www.pixiv.net/users/18604994) · [Bilibili](https://space.bilibili.com/4168597).
- **Small-tailqwq**는 [dsh-deep-whale](https://github.com/Small-tailqwq/dsh-deep-whale)에서 이 플러그인이 사용하는 심해 궁전 배경, 고래 소녀 전신 이미지, Galgame UI 장식과 전체 저작자 표시 계보를 공개했습니다. 이 프로젝트는 해당 소재를 바탕으로 표정 이미지 8개와 11행 데스크톱 펫 애니메이션 아틀라스 1개를 추가 제작했습니다.
- [dsh-web-ui](https://github.com/zhu1090093659/dsh-web-ui)에 포함된 **@linxin666/dsh-pet**은 펫 상태 애니메이션, 클릭 상호작용, DSH 연결을 구현할 때 참고했습니다. 현재 고래 소녀 펫 아틀라스는 이 프로젝트에서 제작했으며 `dsh-pet`이 제공한 이미지가 아닙니다.
- **Craybreeding / [Hatch Pet](https://github.com/Craybreeding/hatch-pet)**은 Codex v2용 8 × 11 펫 아틀라스 생성·검증·패키징 워크플로를 공개했습니다. 이 프로젝트는 해당 절차로 고래 소녀 아틀라스를 구성하고 점검했으며, Hatch Pet의 예시 동물 이미지는 사용하지 않았습니다.
- Claude, GPT, Gemini, Kimi, Grok 캐릭터 이미지 5개와 Galgame UI는 이 프로젝트에서 만든 비공식 AI 보조 소재입니다. 해당 기업의 공식 캐릭터, 제휴 또는 보증을 뜻하지 않습니다.

이 오픈소스 소재와 구현이 도움이 되었다면 [dsh-deep-whale](https://github.com/Small-tailqwq/dsh-deep-whale), [dsh-web-ui](https://github.com/zhu1090093659/dsh-web-ui), [Hatch Pet](https://github.com/Craybreeding/hatch-pet)에 Star를 눌러 주시거나 Pixiv 또는 Bilibili에서 上善과 ZipZipPipe를 팔로우해 주세요. 설치, 실행 또는 호환성 문제는 소재 제작자에게 플러그인 코드를 문의하는 대신 [이 저장소의 Issues](https://github.com/JAdpp/dsh-whale-galgame/issues)에 남겨 주세요.

DeepSeek, Claude, ChatGPT/GPT, Gemini, Kimi, Grok 등의 명칭과 상표는 각 권리자에게 속합니다. 이 프로젝트는 비공식 커뮤니티 플러그인이며 해당 기업과의 제휴, 협력 또는 보증 관계가 없습니다.
