# b2b-promo 프로젝트의 최상위 지침

## 반드시 준수할 최우선 지침

- 모든 대화는 한국어로 할 것
- 오버엔지니어링 금지

## 개발할 때 다음 사항을 준수할 것

- 안드레 카파시의 CLAUDE.md
- https://raw.githubusercontent.com/multica-ai/andrej-karpathy-skills/refs/heads/main/CLAUDE.md

## 참조 문서 (docs/)

작업 전 관련 문서를 먼저 확인할 것. 각 문서 최상단에 변경 이력이 있으니 최신 버전을 참고한다.

| 문서 | 내용 |
|---|---|
| `docs/1-domain-definition.md` | 도메인 정의서 — 핵심 액터/엔티티, 유스케이스, 비즈니스 규칙(BR-1~4), 예외케이스(EX-1~5), MVP 범위. 비즈니스 규칙의 원천(source of truth) |
| `docs/2-usecase.md` | 유스케이스 다이어그램 (mermaid) |
| `docs/3-prd.md` | PRD — 기능요구사항(FR-1~4), 비기능요구사항, 기술스택, 일정. 요구사항의 원천 |
| `docs/4-user-scenario.md` | 사용자 시나리오 (정상/예외 흐름) |
| `docs/5-project-principle.md` | 프로젝트 구조 설계 원칙 — 레이어/네이밍/REST 컨벤션/테스트/보안 원칙, 프론트·백엔드 디렉토리 구조. 네이밍/구조의 원천 |
| `docs/6-arch-diagram.md` | 기술 아키텍처 다이어그램 (mermaid) |
| `docs/7-wireframe.md` | 주요 화면 와이어프레임 (데스크탑+모바일 반응형) |
| `docs/8-erd.md` / `docs/8-schema.sql` | ERD 및 PostgreSQL DDL. 스키마의 원천 |
| `docs/9-plan.md` | 구현 실행계획 — DB/BE/FE Task 분해, 선행 Task, 체크박스 완료조건. 작업 진행 시 이 문서의 체크박스를 갱신할 것 |
| `docs/swagger.json` | OpenAPI 3.0 스펙 |

문서 간 불일치가 발견되면 위 "원천" 문서 기준으로 나머지를 맞춘다.
