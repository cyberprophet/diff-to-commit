# Diff-to-Commit VS Code Extension - 회고

작성일: 2026-01-25

## 배경

`diff-to-commit`은 현재 변경사항(`git diff`)을 기반으로 커밋 메시지를 생성하는 VS Code 확장이다. 초기 목표는 "작업 흐름을 끊지 않고" 커밋 메시지 품질을 끌어올리는 것이었다.

## 목표

- 커밋 메시지 생성 백엔드를 유연하게 전환 가능하게 만들기 (GitHub Copilot / API Key)
- 인증/설정 흐름을 VS Code UX에 자연스럽게 통합하기
- 릴리즈/퍼블리시를 자동화해 반복 작업을 제거하기
- 실제 사용 중 터지는 치명적인 Git 인자 버그를 수정하기

## 작업 요약

### 1) 버그 수정: `git diff` 인자 순서

- 문제: `--no-ext-diff` 옵션이 `diff` 서브커맨드보다 앞에 배치되어 "unknown option" 오류가 발생
- 조치: `src/core/git/diff.ts`에서 인자 순서를 수정해 정상 동작하도록 변경

### 2) 하이브리드 인증/백엔드: Copilot + API Key

커밋 메시지 생성을 "provider"로 추상화하고, 설정에 따라 라우팅하는 구조로 정리했다.

- Provider 인터페이스 및 라우팅
  - `src/core/providers/types.ts`
  - `src/core/providers/router.ts`

- GitHub Copilot 경로
  - GitHub OAuth 로그인 후 Copilot 토큰을 얻어 내부 Chat API 호출
  - `src/core/copilot/copilotClient.ts`
  - `src/extension/providers/copilotProvider.ts`

- API Key 경로
  - API Key 저장/삭제 및 OpenAI 호환 호출
  - `src/extension/providers/apiKeyProvider.ts`
  - `src/core/ai/openaiClient.ts` (커스텀 헤더 지원)
  - `src/core/commit/message.ts` (헤더 패스스루)

- VS Code 커맨드/시크릿
  - `src/extension/commands/signIn.ts` (Copilot 사용 가능 여부 체크 포함)
  - `src/extension/commands/signOut.ts` (토큰 캐시 정리)
  - `src/extension/commands/clearApiKey.ts`
  - `src/extension/secrets.ts`

- 설정/엔트리포인트 반영
  - `src/extension.ts`
  - `src/extension/config.ts`
  - `src/core/config.ts`
  - `package.json` (commands/settings/activation events)
  - `README.md` (사용법/설정 문서화)

### 3) CI/CD: 태그 기반 퍼블리시 자동화

- `.github/workflows/publish.yml` 추가
  - `v*` 태그 푸시 시 VS Code Marketplace 퍼블리시
  - GitHub Secret으로 `VSCE_PAT` 사용

- Marketplace 호환성 이슈 대응
  - publisher를 `Dayond`로 변경
  - category를 `Other`로 변경 (마켓플레이스 검증 통과 목적)

### 4) 배포 결과

- 브랜치: `feat/hybrid-auth-copilot` -> `main` 머지
- 태그: `v1.0.0`, `v1.0.1`
- Marketplace: `Dayond.diff-to-commit`로 퍼블리시 완료

## 결정과 트레이드오프

- Copilot 연동은 공식적으로 보장되는 퍼블릭 API라기보다 "내부 API" 성격이 강함
  - 장점: 사용자가 별도의 API Key 없이도 즉시 사용 가능
  - 리스크: API 변경/차단 시 기능이 깨질 수 있음

- 백엔드 선택은 provider router로 중앙집중화
  - 장점: 확장 포인트가 명확해지고 테스트/추가 백엔드(OpenRouter, Azure 등) 도입이 쉬워짐
  - 단점: 설정/인증 조합이 늘수록 케이스 관리가 필요

## 운영/릴리즈 메모

- 레포: `https://github.com/cyberprophet/diff-to-commit`
- 확장 ID: `Dayond.diff-to-commit`
- 퍼블리시 트리거: `v*` 태그 푸시

## 다음 단계 (제안)

1. Copilot API 호출 실패 시 사용자에게 더 구체적인 에러 가이드 제공 (재로그인/권한/네트워크)
2. Provider별 관측성 추가 (로그 레벨/추적 ID)로 디버깅 비용 절감
3. 간단한 E2E 스모크 테스트(예: 명령 실행 -> 메시지 생성) 추가로 배포 안정성 강화
4. 설정 문서에 "backend=auto" 선택 기준과 우선순위 명시
