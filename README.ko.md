# dsh-whale-galgame · 세션을 넘나드는 작업 이벤트를 감지하는 다중 캐릭터 Galgame 엔진

[简体中文](README.md) · [English](README.en.md) · [日本語](README.ja.md) · **한국어**

Harness에서 방금 마친 작업이 캐릭터의 다음 한마디로 자연스럽게 이어집니다.

`dsh-whale-galgame`은 DeepSeek Harness Web에 독립된 다중 캐릭터 Galgame 화면을 추가합니다. 이벤트가 발생한 작업공간별로 최근 디버깅, 글쓰기, 조사 등의 활동을 로컬 결정론적 규칙으로 11개 작업 이벤트 범주로 분류한 뒤, 원문이 없는 안전한 결과만 하나의 전역 이벤트 큐에 합칩니다. Galgame에서 대화하면 현재 캐릭터가 그 작업을 자연스럽게 화제로 이어 갑니다. Harness에서 사용자가 입력한 원문은 로컬 분류에만 사용되고, 답변 모델에는 정해진 작업 범주와 상태 단서만 전달됩니다. 도구 인자, 도구 결과, assistant 답변 본문은 이 감지 경로에 들어가지 않습니다.

DeepSeek, Claude, GPT, Gemini, Kimi, Grok은 각각 독립된 여섯 캐릭터에 대응하며, 표시할 캐릭터와 실제 답변 모델은 따로 선택할 수 있습니다. 현재 캐릭터, 캐릭터별 관계 진행도와 설정, 대화 기록, 답변 선택지, 이미 소비한 작업 기억, 사용자 지정 캐릭터 이미지, CG 도감, 배경뿐 아니라 token 정산 잔액과 플러그인 환경설정까지 작업공간을 넘어 하나의 연속된 전역 상태로 공유됩니다. 작업공간과 세션은 Harness 이벤트의 출처와 수집 중복 제거를 식별하는 데만 쓰이므로, 작업공간을 바꿔도 이야기가 처음부터 시작되거나 같은 캐릭터가 같은 이벤트를 다시 꺼내지 않습니다. 호감도는 매번 순서가 바뀌는 세 가지 답변 선택지와 플러그인 실행 중 새로 관측된 Harness token 사용량에 따라 변하고, 장기간 상호작용이 없으면 감소합니다. 레벨 상한은 없습니다. DashScope key를 설정하면 레벨업 때 최근 작업을 반영한 1920 × 1080 가로형 기념 CG를 생성할 수 있습니다. 데스크톱 펫은 끌 수 있고, 클릭하면 Galgame 화면을 엽니다.

![DSH Web에서 실제로 실행 중인 dsh-whale-galgame](docs/screenshots/galgame-overview.jpg)

> 플러그인 화면은 현재 중국어 간체로 표시됩니다. 이 페이지는 설치 및 사용 문서의 한국어 번역입니다.

## 기능

- 표시할 캐릭터와 답변 모델을 따로 선택합니다. 캐릭터는 작업공간 모델을 따르거나 고정할 수 있고, 답변은 기본 `deepseek-v4-flash`, 작업공간 모델 또는 DSH 모델 목록에서 선택할 수 있습니다.
- 6개 캐릭터의 호감도, 레벨, 캐릭터 설정, 대화 기록, 답변 선택지, 이미 소비한 작업 기억, 사용자 지정 캐릭터 이미지, CG 도감과 배경은 캐릭터별로 분리되면서도 작업공간을 넘어 전역 공유됩니다. 현재 캐릭터, token 잔액과 플러그인 환경설정도 계속 이어집니다.
- 각 턴에 친밀함, 보통, 거리 두기의 세 가지 답변 후보를 순서를 섞어 표시합니다. 직접 입력도 사용할 수 있습니다.
- 캐릭터를 바꾸면 해당 캐릭터의 내장 배경도 함께 바뀌어 표시됩니다. 고래 소녀의 기본값은 계속 심해 궁전이며, 새 해변 서재는 선택할 수 있는 내장 대체 배경입니다. 사용자가 올린 배경이나 저장한 CG는 내장 배경으로 복원할 때까지 캐릭터 기본값을 덮어씁니다.
- 배경, 캐릭터별 이미지, 대화 기록, CG 도감, 데스크톱 펫을 화면에서 관리합니다. 펫을 클릭하면 `galgame` 탭이 열립니다.

## 호감도와 세션 간 컨텍스트

### 관계 진행

각 캐릭터는 Lv.1, 호감도 0에서 시작하며 상태는 서로 분리해 저장됩니다. 친밀함, 보통, 거리 두기 선택지는 각각 +1, 0, -1로 반영되고 위치는 매 턴 바뀌며, 직접 입력은 간단한 키워드 규칙으로 판정합니다. 플러그인이 실행 중일 때 모든 작업공간에서 새로 관측한 Harness `assistant/message` usage 이벤트는 하나의 전역 token 잔액에 더해집니다. 입력과 출력 token이 5,000개 누적될 때마다 정산 시점의 현재 캐릭터 호감도가 1 올라갑니다. 한 번에 최대 3까지 반영하고 나머지는 다음 정산으로 이월하며, 플러그인 자체가 시작한 모델 호출은 계산하지 않고 플러그인 시작 전의 usage도 소급해 다시 계산하지 않습니다. 24시간의 유예 기간이 지난 뒤에도 활동이 없으면 모든 캐릭터의 호감도가 하루에 2씩 줄어들며, 0 아래로는 내려가지 않습니다.

레벨업 기준은 `30 + 15 × (Lv - 1)`, 즉 30, 45, 60……입니다. 기준에 도달하면 레벨이 오르고 초과분은 다음 레벨로 이월되며, 레벨 상한은 없습니다. 관계에 따른 말투는 5단계로 변하고 Lv.5 이후에는 가장 친밀한 단계를 유지합니다. 유효한 DashScope key를 설정한 경우 레벨업할 때마다 기념 CG 생성을 시도합니다.

### Harness 작업 이벤트

각 이벤트 출처에 대해 플러그인은 해당 작업공간에서 최근 72시간 내의 Harness 실시간 및 저장된 최상위 세션을 최대 16개까지 확인하고, 각 세션의 마지막 240개 이벤트만 검사합니다. 로컬의 결정적 규칙으로 작업을 코드 디버깅, 코드 개발, 문서 요약, 문서 작성, 문학 창작, 자료 조사, 데이터 분석, 시각 디자인, 프레젠테이션 작성, 번역·교정 또는 작업 계획으로 분류한 뒤 안전한 결과를 전역 이벤트 큐에 합칩니다. 텍스트 분류에는 사람이 명시적으로 제출한 user 본문만 사용합니다. 도구 이름과 턴 종료 상태도 로컬 판정에 쓸 수 있지만, 도구 인자와 실행 결과, assistant 본문은 읽거나 전송하지 않습니다.

Galgame 답변 모델과 CG 생성 서비스에는 미리 정해진 작업 분류와 상태 힌트만 전달합니다. 캐릭터는 현재 화제에 답하면서, 예를 들어 디버깅 작업 뒤에 쉬어 가라고 말하는 식으로 관련된 짧은 관심을 자연스럽게 한 문장 덧붙입니다. 캐릭터별로 이미 소비한 이벤트 지문과 마지막 언급 시간은 전역 상태에 저장됩니다. 작업공간을 바꿔도 같은 이벤트를 같은 캐릭터가 다시 먼저 꺼내지 않으며, 서로 다른 이벤트 사이에는 최소 30분의 간격을 둡니다. 작업 이벤트는 대화 주제에만 영향을 주며 호감도를 직접 바꾸지 않습니다.

## 포함된 기본 이미지

설치본에는 실제로 사용하는 시각 소재 22개가 내장됩니다. 캐릭터 이미지 6개, 내장 배경 7개, 고래 소녀 표정 8개, [dsh-deepseek-girl-pet](https://github.com/f0909172434/dsh-deepseek-girl-pet)에서 가져온 11행 데스크톱 펫 애니메이션 아틀라스 1개입니다. 아래 6개 이미지는 각 캐릭터의 기본 이미지이며, [`assets/default/`](assets/default/README.md)에서 전체 내보내기 파일과 용도를 확인할 수 있습니다. npm 설치본은 이미지가 내장된 클라이언트 bundle만 포함하고, 원본 내보내기 파일이나 생성 이미지 소스는 중복해 담지 않습니다.

<table>
  <tr>
    <td align="center"><img src="assets/default/maid-left.webp" width="180" alt="DeepSeek 고래 소녀 기본 이미지"><br><strong>DeepSeek · 고래 소녀</strong></td>
    <td align="center"><img src="assets/default/claude-amber-manuscript-mediator-v5.webp" width="180" alt="Claude 모델 소녀 克洛德 기본 이미지"><br><strong>Claude · 克洛德</strong></td>
    <td align="center"><img src="assets/default/gpt-recursive-weaver-v7.webp" width="180" alt="GPT 모델 소녀 小吉 기본 이미지"><br><strong>GPT · 小吉</strong></td>
  </tr>
  <tr>
    <td align="center"><img src="assets/default/gemini-dual-prism-translator-v4.webp" width="180" alt="Gemini 모델 소녀 双子 기본 이미지"><br><strong>Gemini · 双子</strong></td>
    <td align="center"><img src="assets/default/kimi-lunar-scroll-navigator-v5.webp" width="180" alt="Kimi 모델 소녀 月见 기본 이미지"><br><strong>Kimi · 月见</strong></td>
    <td align="center"><img src="assets/default/grok-cosmic-signal-ranger-v5.webp" width="180" alt="Grok 모델 소녀 洛可 기본 이미지"><br><strong>Grok · 洛可</strong></td>
  </tr>
</table>

새로 추가한 6개 캐릭터 배경은 아래와 같습니다. Claude, GPT, Gemini, Kimi, Grok은 각자의 장면을 기본 배경으로 사용합니다. DeepSeek 고래 소녀의 기본 배경은 `palace-night.webp`로 유지되며, 해변 서재는 선택할 수 있는 내장 대체 배경입니다.

<table>
  <tr>
    <td align="center"><img src="assets/default/bg-deepseek-seaside-study.webp" width="260" alt="DeepSeek 고래 소녀 해변 서재 대체 배경"><br><strong>DeepSeek · 선택 대안</strong></td>
    <td align="center"><img src="assets/default/bg-claude-writing-study.webp" width="260" alt="Claude 글쓰기 서재 기본 배경"><br><strong>Claude</strong></td>
    <td align="center"><img src="assets/default/bg-gpt-collaboration-workshop.webp" width="260" alt="GPT 협업 공방 기본 배경"><br><strong>GPT</strong></td>
  </tr>
  <tr>
    <td align="center"><img src="assets/default/bg-gemini-twin-creative-studio.webp" width="260" alt="Gemini 쌍둥이 창작 스튜디오 기본 배경"><br><strong>Gemini</strong></td>
    <td align="center"><img src="assets/default/bg-kimi-moonlit-reading-study.webp" width="260" alt="Kimi 달빛 독서실 기본 배경"><br><strong>Kimi</strong></td>
    <td align="center"><img src="assets/default/bg-grok-electronics-studio.webp" width="260" alt="Grok 전자 공작실 기본 배경"><br><strong>Grok</strong></td>
  </tr>
</table>

나머지 런타임 소재는 원본 해상도의 투명 `whale-*.webp` 표정 이미지 8개와 8열 × 11행 애니메이션 아틀라스 `pet-spritesheet.webp`입니다. 앞의 기본 이미지 21개와 펫 아틀라스에는 서로 다른 라이선스가 적용됩니다. 출처, 수정 사항, 파일별 라이선스는 [NOTICE](NOTICE.md)와 [제3자 라이선스 색인](THIRD_PARTY_LICENSES.md)을 확인하세요.

Galgame 레이아웃, 대화 상자, 컨트롤, 장식은 [`src/client/index.ts`](src/client/index.ts)에 공개되어 있으며 비공개 UI 이미지 팩에 의존하지 않습니다.

## 설치

`dsh` 명령과 Web profile을 사용할 수 있는 DeepSeek Harness가 필요합니다.

~~~sh
dsh plugin --profile web add dsh-whale-galgame
~~~

설치 후 실행 중인 Web profile을 먼저 중지한 다음 다시 시작하세요.

~~~sh
dsh --profile web
~~~

소스 설치에서 `pnpm dsh`를 사용한다면 같은 인수를 유지하면 됩니다.

### 업데이트 및 제거

~~~sh
dsh plugin --profile web update dsh-whale-galgame
dsh plugin --profile web remove dsh-whale-galgame
~~~

두 작업 모두 실행 후 Web profile을 중지하고 다시 시작해야 합니다.

### GitHub에서 설치 (main 추적)

배포판 대신 최신 커밋을 따라가고 싶을 때만 필요합니다.

~~~sh
dsh plugin --profile web add github:JAdpp/dsh-whale-galgame#main
~~~

git 설치는 이 저장소의 `prepare` 빌드 스크립트를 즉시 실행하므로 pnpm이 기본적으로
차단합니다. 첫 실행은 `ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED`로 실패하며 키를
출력하는데, 이를 profile의 `pnpm-workspace.yaml`에 추가하세요.

~~~yaml
allowBuilds:
  'dsh-whale-galgame@https://codeload.github.com/JAdpp/dsh-whale-galgame/tar.gz/<commit>': true
~~~

이 키는 특정 커밋에 고정되므로 새 커밋을 따라갈 때마다 pnpm이 출력한 값으로
갱신해야 합니다. **npm에서 설치하면 이 과정이 전혀 필요 없습니다** — 배포
패키지는 미리 빌드되어 있고 설치 시 어떤 스크립트도 실행하지 않습니다.

## 사용 및 설정

![DSH Web의 플러그인 설정 화면](docs/screenshots/plugin-settings.png)

Galgame 상단 바에서 표시할 캐릭터와 실제 답변 모델을 전환할 수 있습니다. 배경이나 현재 캐릭터의 이미지도 여기서 업로드합니다. PNG, JPEG, WebP, AVIF를 지원하며 브라우저 기준 파일당 제한은 12 MB입니다.

“설정 → 플러그인 → 플러그인 설정”에서 플러그인 사용 여부, 기본 캐릭터, 기본 답변 모델을 지정할 수 있습니다. 플러그인을 끄면 Galgame 대화와 호감도 계산은 멈추지만 저장된 데이터는 삭제되지 않습니다.

### 캐릭터 설정 사용자 지정

Galgame 상단 바에서 “캐릭터 이미지” 옆의 “캐릭터 설정”을 선택하면 현재 캐릭터의 다음 6개 항목을 편집할 수 있습니다.

- 캐릭터 별명
- 캐릭터가 사용자를 부르는 호칭
- 첫 인사
- 성격
- 말투
- CG 외형 설명

사용자 설정은 여섯 캐릭터별로 따로 저장되며 모든 작업공간에서 공유됩니다. “설정 저장”과 “기본값 복원”으로 바뀌는 것은 현재 캐릭터의 위 여섯 항목뿐이며, 호감도와 레벨, 장기 기억, 사용자 캐릭터 이미지는 초기화되지 않습니다. 사용자와 캐릭터의 실제 대화가 시작되기 전에는 “첫 인사”를 수정하거나 기본값으로 복원하면 현재 인사만 제자리에서 바뀌고 자동 등장 내레이션은 그대로 유지됩니다. 실제 대화가 시작된 뒤에는 기록에 삽입하거나 교체하거나 다시 표시하지 않습니다. CG 외형 설명은 이후 생성하는 레벨업 CG에 적용되며 도감에 이미 저장된 이미지는 바꾸지 않습니다.

사용자 설정으로 플러그인의 안전 제약이나 캐릭터 답변의 한 문장 제한을 우회할 수 없습니다.

### 내장 데스크톱 펫

데스크톱 펫은 이 플러그인에 내장되어 있으므로 따로 설치할 필요가 없습니다. 새로 설치하면 기본으로 켜지고 DSH 기본 화면 오른쪽 아래에 표시됩니다. 펫을 클릭하면 `galgame` 탭이 열립니다. Galgame 상단 바의 “데스크톱 펫 · 켬/끔”은 펫 표시만 제어하는 독립 스위치입니다. “설정 → 플러그인 → 플러그인 설정”의 “플러그인 사용”은 플러그인 전체를 제어하며, 끄면 펫이 숨겨지고 Galgame 대화와 호감도 계산도 멈춥니다.

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

실행 데이터는 다음 두 계층으로 나뉩니다. 둘 다 개인 데이터로 취급하세요.

- `DSH_HOME/storages/dsh-whale-galgame/global.json`에는 완전하고 연속된 Galgame 상태를 저장합니다. 현재 캐릭터, 여섯 캐릭터 각각의 관계 진행도, 캐릭터 설정, 대화 기록, 현재 답변 선택지, 이미 소비한 작업 기억, 사용자 지정 캐릭터 이미지, CG 도감, 배경뿐 아니라 전역 작업 이벤트 큐, token 정산 잔액, 중복 제거 지문과 플러그인 환경설정이 포함됩니다.
- 현재 작업공간 루트의 `.whale-girl-save.json`에는 가벼운 이벤트 출처 및 이전 저장 파일 마이그레이션 표식만 남습니다. 별도의 이야기, 대화, 작업 기억이나 token 원장을 저장하지 않습니다.
- 새 작업공간에서도 같은 현재 캐릭터, 대화 기록, 답변 선택지와 관계 진행을 그대로 이어 갑니다. 작업공간과 세션 식별자는 Harness 이벤트의 출처를 찾고 수집 중복을 제거하는 데만 쓰이며, 이야기를 다시 시작하거나 이전의 작업공간 간 거부 화면을 표시하지 않습니다.
- 이전 v9 작업공간 저장 파일을 처음 열면 마이그레이션할 수 있는 이야기와 캐릭터 데이터를 위 전역 파일에 합치고, 해당 작업공간의 `.whale-girl-save.json`을 출처/마이그레이션 표식으로 다시 씁니다.

- 일반 대화는 DSH에서 선택한 모델 제공자에게 전송됩니다.
- 레벨업 CG를 생성하면 텍스트 프롬프트가 DashScope로 전송됩니다.
- 사용자가 추가한 배경과 캐릭터 이미지는 전역 저장 파일에 남으며 위 두 외부 요청에는 포함되지 않습니다.
- Harness 원문은 Galgame 저장 파일에 기록하지 않습니다. 전역 상태에는 미리 정해진 분류와 상태 힌트, 익명 중복 제거 지문과 마지막 언급 시간만 저장하고, 외부 요청에도 미리 정해진 분류와 상태 힌트만 포함합니다.

이 플러그인 저장소의 `.gitignore`는 다른 작업공간을 자동으로 보호하지 않습니다. 현재 작업공간도 Git 저장소라면 해당 작업공간의 `.gitignore`에 다음을 추가하세요.

~~~gitignore
.whale-girl-save.json
.whale-girl-save.*.json
~~~

## 개발

~~~sh
npm ci
npm run sanitize:backgrounds
npm run embed:art
npm run export:art
npm run verify
~~~

`lib/`와 `src/client/art.generated.ts`는 빌드 산출물이므로 저장소에 포함하지 않습니다. `prepare` 스크립트가 설치 시 `npm run embed:art`와 `tsdown`을 실행하므로 git 기반 설치는 스스로 빌드되고 저장소 tarball도 가볍게 유지됩니다. 클론한 뒤 `npm install`을 한 번 실행하면 로컬에 생성됩니다. `npm run sanitize:backgrounds`는 6개 배경에서 화면 표시에 필요 없는 WebP 메타데이터를 제거하고, `npm run embed:art`는 허용 목록의 이미지를 런타임 소스에 쓰며, `npm run export:art`는 바이트 단위 검증을 위해 공개 소재 22개를 다시 내보냅니다.

## 라이선스와 감사

코드, Galgame UI 구현, 문서는 [MIT License](LICENSE.md)를 따릅니다. 캐릭터 이미지 6개, 내장 배경 7개, 고래 소녀 표정 8개로 구성된 기본 이미지 21개는 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)으로 배포합니다. 프로젝트에서 제작한 AI 보조 이미지는 메인테이너가 해당 권리를 보유한 범위에서만 이 라이선스로 제공합니다. `pet-spritesheet.webp`와 [dsh-deepseek-girl-pet](https://github.com/f0909172434/dsh-deepseek-girl-pet)에서 직접 상속한 코드는 업스트림의 MIT 라이선스를 그대로 따릅니다. 파일별 범위는 [NOTICE](NOTICE.md), 보존된 업스트림 라이선스 원문은 [`assets/default/licenses/`](assets/default/licenses/)에서 확인하세요.

마지막으로 구체적인 작품과 구현 지식을 커뮤니티에 공개해 주신 분들께 감사드립니다.

- **上善**은 고래 소녀의 원래 캐릭터 이미지를 만들었습니다: [Pixiv](https://www.pixiv.net/users/62155430) · [Bilibili](https://space.bilibili.com/4456176).
- **ZipZipPipe**는 이 고래 소녀에 DeepSeek 요소를 더해 메이드 고래 소녀로 2차 창작했습니다: [Pixiv](https://www.pixiv.net/users/18604994) · [Bilibili](https://space.bilibili.com/4168597).
- **Small-tailqwq**는 [dsh-deep-whale](https://github.com/Small-tailqwq/dsh-deep-whale)에서 이 플러그인이 사용하는 심해 궁전 배경, 고래 소녀 전신 이미지, Galgame UI 장식과 전체 저작자 표시 계보를 공개했습니다. 이 프로젝트는 해당 소재를 바탕으로 표정 이미지 8개를 추가 제작했습니다.
- **f0909172434 / [dsh-deepseek-girl-pet](https://github.com/f0909172434/dsh-deepseek-girl-pet)**은 DSH용 고래 소녀 데스크톱 펫을 MIT 라이선스로 공개했습니다. 이 플러그인의 펫 기능은 해당 프로젝트를 바탕으로 2차 개발했으며, `pet-spritesheet.webp`는 업스트림 아틀라스와 동일합니다. 이 프로젝트에서는 플러그인 통합 방식과 화면 스타일을 수정하고, 펫을 클릭하면 Galgame 화면이 열리는 동작을 추가했습니다.
- Claude, GPT, Gemini, Kimi, Grok 캐릭터 이미지 5개, 일상 장면 배경 6개, Galgame UI는 이 프로젝트에서 만든 비공식 AI 보조 소재입니다. 해당 기업의 공식 캐릭터, 제휴 또는 보증을 뜻하지 않습니다.

이 오픈소스 소재와 구현이 도움이 되었다면 [dsh-deep-whale](https://github.com/Small-tailqwq/dsh-deep-whale)와 [dsh-deepseek-girl-pet](https://github.com/f0909172434/dsh-deepseek-girl-pet)에 Star를 눌러 주시거나 Pixiv 또는 Bilibili에서 上善과 ZipZipPipe를 팔로우해 주세요. 설치, 실행 또는 호환성 문제는 소재 제작자에게 플러그인 코드를 문의하는 대신 [이 저장소의 Issues](https://github.com/JAdpp/dsh-whale-galgame/issues)에 남겨 주세요.

DeepSeek, Claude, ChatGPT/GPT, Gemini, Kimi, Grok 등의 명칭과 상표는 각 권리자에게 속합니다. 이 프로젝트는 비공식 커뮤니티 플러그인이며 해당 기업과의 제휴, 협력 또는 보증 관계가 없습니다.

## 관련 프로젝트

- [gal-view](https://github.com/Ayase34/gal-view)
- [dsh-galgame](https://github.com/Lanxing6480/dsh-galgame)
- 업스트림 데스크톱 펫 프로젝트(이미 내장됨, 별도 설치 불필요): [dsh-deepseek-girl-pet](https://github.com/f0909172434/dsh-deepseek-girl-pet)

마음에 드는 프로젝트가 있다면 저장소에 Star를 눌러 주세요.
