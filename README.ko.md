# dsh-whale-galgame

![version](https://img.shields.io/badge/version-0.2.0-6fa8dc) ![platform](https://img.shields.io/badge/platform-DSH%20Web-1c9a86) ![license](https://img.shields.io/badge/code-MIT-c8a35f)

[简体中文](README.md) · [English](README.en.md) · [日本語](README.ja.md) · **한국어**

DeepSeek Harness Web용 다중 캐릭터 Galgame 인터페이스와 선택형 데스크톱 펫입니다. 캐릭터 출처, 대화 모델, 배경, 캐릭터별 스프라이트를 서로 독립적으로 변경할 수 있습니다.

![Galgame 인터페이스 예시](docs/preview.svg)

> 이 프로젝트는 비공식 커뮤니티 플러그인입니다. 공개 배포판에는 개인정보가 없는 중립 플레이스홀더만 포함되며, 관리자의 게임 저장 파일, 대화 기록, 비공개 CG, 업로드 이미지, 로컬 원본 에셋은 포함되지 않습니다.

## 주요 기능

- **6개의 독립 캐릭터**: DeepSeek, Claude, GPT, Gemini, Kimi, Grok의 호감도, 레벨, 기억, 대화 기록, CG 도감을 각각 분리해 저장합니다.
- **캐릭터와 모델 분리**: 작업공간 모델을 따르거나 캐릭터를 고정하고, 플러그인 기본 Flash·작업공간·DSH의 다른 사용 가능 모델을 대화 모델로 선택할 수 있습니다.
- **로컬 비주얼 사용자화**: 상단 바에서 Galgame 전용 배경과 캐릭터별 전용 스프라이트를 업로드할 수 있습니다.
- **Galgame 시스템**: 다양한 답변 선택지, 호감도와 레벨, 대화 기록, CG 도감, 선택형 레벨업 기념 CG를 제공합니다.
- **선택형 데스크톱 펫**: 클릭하면 가능한 경우 Galgame 탭으로 이동하며, 다른 플로팅 플러그인과 충돌하면 끌 수 있습니다.
- **DSH 설정 통합**: “설정 → 플러그인 → 플러그인 설정”에서 활성화, 캐릭터, 대화 모델을 관리합니다.

![플러그인 설정 예시](docs/settings.svg)

## 빠른 설치

### 요구 사항

- `dsh` 명령을 실행할 수 있는 DeepSeek Harness.
- DSH Web profile.

### GitHub에서 설치

```sh
dsh plugin --profile web add github:JAdpp/dsh-whale-galgame#main
```

설치 후 Web profile을 다시 시작하세요. 각 대화의 탭에 `galgame`이 표시되어야 합니다.

```sh
dsh --profile web
```

Harness 소스 checkout에서 실행 중이라면 환경에 맞게 `dsh`를 `pnpm dsh` 명령으로 바꾸세요.

### 업데이트 및 제거

```sh
dsh plugin --profile web update @dsh-external/dsh-whale-galgame
dsh plugin --profile web remove @dsh-external/dsh-whale-galgame
```

두 작업 모두 Web profile 재시작이 필요합니다.

## 설정

### 상단 바

- **캐릭터 출처**: 작업공간을 따르거나 특정 모델 캐릭터를 고정합니다.
- **실제 대화**: 플러그인 기본값, 작업공간, 다른 사용 가능 모델을 선택합니다.
- **배경 이미지**: Galgame 전용 배경을 미리 보기, 적용, 교체, 초기화합니다.
- **캐릭터 스프라이트**: 현재 캐릭터 전용 이미지를 업로드하거나 기본 이미지로 복원합니다.

PNG, JPEG, WebP, AVIF를 지원하며 브라우저 제한은 12 MB입니다. 이미지는 현재 작업공간의 로컬 저장 파일에만 기록되고 이 저장소로 업로드되지 않습니다.

### 선택형 레벨업 CG

DashScope key가 없어도 채팅, 캐릭터 전환, 기록, 호감도, 사용자 이미지 기능은 정상 작동합니다. CG 생성만 사용할 수 없습니다. 활성화하려면 로컬 DSH 프로세스 환경에 설정하세요.

```powershell
$env:DASHSCOPE_API_KEY = 'your-local-key'
dsh --profile web
```

```sh
DASHSCOPE_API_KEY='your-local-key' dsh --profile web
```

설치된 로컬 `cordis.patch.yml`을 수정할 수도 있지만 실제 key를 commit하지 마세요. 저장소의 값은 항상 비어 있습니다.

## 데이터와 개인정보

![데이터 흐름](docs/architecture.svg)

실행 상태는 활성 작업공간 루트의 `.whale-girl-save.json`에 저장됩니다. 캐릭터 상태, 대화 기록, CG, 사용자가 업로드한 배경과 스프라이트를 포함할 수 있으며 Git 대상에서 제외됩니다.

- 일반 폴링은 메타데이터만 반환하고 큰 이미지는 필요할 때만 읽습니다.
- 사용자 스프라이트는 캐릭터별로 분리되며 배경은 작업공간 단위입니다.
- 플러그인을 끄면 Galgame 대화와 호감도 정산을 멈추고, 다시 켤 수 있도록 설정 카드는 유지합니다.
- 공개 문서와 빌드에는 실제 사용자 기록을 사용하지 않습니다.

## 개발

```sh
npm ci
npm run prune:art
npm run verify
```

GitHub 설치 시 별도 빌드가 필요 없도록 `lib/index.js`와 `lib/client.js`를 commit합니다. `src/`를 변경한 뒤 두 bundle을 다시 빌드하세요.

## 저장소 구조

```text
build/                         DSH Web 클라이언트 번들 어댑터
docs/                          개인정보가 없는 README SVG
lib/                           설치 가능한 host/client bundle
scripts/prune-art.mjs          사용하지 않는 내장 에셋 제거
src/index.ts                   상태, 모델 라우팅, 저장, CG, 로컬 API
src/client/index.ts            Galgame, 펫, 설정, 업로드 UI
src/client/art.generated.ts    공개판 중립 플레이스홀더
cordis.patch.yml               key가 없는 기본 DSH bundle 설정
```

## 라이선스와 감사

소프트웨어, 문서, 공개판의 중립 플레이스홀더는 MIT License입니다. 자세한 내용은 [LICENSE.md](LICENSE.md)와 [NOTICE.md](NOTICE.md)를 확인하세요.

창작 및 기술적 기반을 제공한 上善, ZipZipPipe, [Small-tailqwq / dsh-deep-whale](https://github.com/Small-tailqwq/dsh-deep-whale), [@linxin666/dsh-pet (dsh-web-ui)](https://github.com/zhu1090093659/dsh-web-ui)에 감사드립니다. 공개 패키지는 이들의 원본 이미지를 재배포하지 않습니다. 로컬에서 제3자 에셋을 추가할 경우 해당 라이선스와 전체 저작자 표기를 준수하세요.

DeepSeek, Claude, ChatGPT/GPT, Gemini, Kimi, Grok 등의 명칭과 상표는 각 권리자에게 속합니다. 이 프로젝트는 해당 기업의 공식 프로젝트가 아니며 제휴 또는 보증을 받지 않았습니다.
