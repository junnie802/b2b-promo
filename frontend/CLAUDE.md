# b2b-promotion 프론트엔드앱 개발을 위한 지침

## 기술 스택 (반드시 준수, `docs/3-prd.md` 6절 원천)

- **프론트엔드 프레임워크**: React 19
- **전역 상태관리**: Zustand
- **서버 상태/통신**: TanStack Query
- 위 스택 외의 상태관리/데이터 페칭 라이브러리(Redux, SWR, Apollo 등)는 도입하지 않는다.

## 참조 문서

작업 전 관련 문서를 먼저 확인할 것.

| 문서 이름 | 문서 | 내용 |
|---|---|---|
| 프로젝트 구조 설계 원칙 | [`../docs/5-project-principle.md`](../docs/5-project-principle.md) | 레이어/네이밍/REST 컨벤션/테스트 원칙, 프론트엔드 디렉토리 구조 |
| 와이어프레임 | [`../docs/7-wireframe.md`](../docs/7-wireframe.md) | 화면별 레이아웃(ASCII), 데스크탑/모바일 반응형, 인터랙션 |
| 스타일 가이드 | [`../docs/10-style.md`](../docs/10-style.md) | 색상/타이포그래피/컴포넌트 스타일, CSS 커스텀 프로퍼티 |
| PRD | [`../docs/3-prd.md`](../docs/3-prd.md) | 기능/비기능 요구사항, 기술스택(React 19, Zustand, TanStack Query) |
| 사용자 시나리오 | [`../docs/4-user-scenario.md`](../docs/4-user-scenario.md) | 화면 흐름, 정상/예외 케이스 |
| 도메인 정의서 | [`../docs/1-domain-definition.md`](../docs/1-domain-definition.md) | 비즈니스 규칙(BR-1~4), 예외케이스(EX-1~5) |
| OpenAPI 스펙 | [`../docs/swagger.json`](../docs/swagger.json) | 백엔드 API 엔드포인트/요청·응답 스키마 |
| 구현 실행계획 | [`../docs/9-plan.md`](../docs/9-plan.md) | FE Task 분해 및 진행 체크박스 |
