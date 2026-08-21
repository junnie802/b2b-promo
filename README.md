# b2b-promo

식자재 유통 B2B 거래처를 위한 프로모션 조회/참여 서비스 MVP.

## 문서 (docs/)

| 문서 | 파일 |
|---|---|
| 도메인 정의서 | [docs/1-domain-definition.md](docs/1-domain-definition.md) |
| 유스케이스 다이어그램 | [docs/2-usecase.md](docs/2-usecase.md) |
| PRD | [docs/3-prd.md](docs/3-prd.md) |
| 사용자 시나리오 | [docs/4-user-scenario.md](docs/4-user-scenario.md) |
| 프로젝트 구조 설계 원칙 | [docs/5-project-principle.md](docs/5-project-principle.md) |
| 기술 아키텍처 다이어그램 | [docs/6-arch-diagram.md](docs/6-arch-diagram.md) |
| 와이어프레임 | [docs/7-wireframe.md](docs/7-wireframe.md) |
| ERD | [docs/8-erd.md](docs/8-erd.md) |
| DB 스키마(DDL) | [docs/8-schema.sql](docs/8-schema.sql) |
| 구현 실행계획 | [docs/9-plan.md](docs/9-plan.md) |
| 스타일 가이드 | [docs/10-style.md](docs/10-style.md) |
| OpenAPI 스펙 | [docs/swagger.json](docs/swagger.json) |

## Demo Site

- Frontend: https://abc-7782-fe.vercel.app
- Backend API: https://abc-7782-be.vercel.app

## 테스트용 계정

| 역할 | 이메일 | 비밀번호 |
|---|---|---|
| 관리자 | admin@b2b-promo.local | ChangeMe123! |
| 거래처 담당자 | buyer.prod.e2e@test.com | NewProd1234! |

## 간략한 테스트 시나리오

1. **회원가입/로그인**: 거래처 담당자로 회원가입 후 로그인 → 프로모션 목록 화면으로 이동
2. **프로모션 조회**: "진행"/"예정" 탭에서 프로모션 목록 확인 → 상세 페이지 진입
3. **참여 신청**: 진행 중인 프로모션에 참여 신청 → 게임 적용 프로모션은 룰렛 애니메이션 후 당첨 경품 확인
4. **내 신청 관리**: "내 신청" 메뉴에서 신청 내역/당첨 결과 확인, 신청 취소 후 재신청(게임 적용 시 재추첨 확인)
5. **관리자 프로모션 관리**: 관리자 계정으로 로그인 → 프로모션 등록(유형/기간/게임 적용 여부) → 게시 → 참여현황 조회 → 종료 처리
6. **마이페이지**: 내 정보(이름/소속 거래처) 수정, 비밀번호 변경

상세 시나리오와 예외 케이스(EX-1~5)는 [docs/4-user-scenario.md](docs/4-user-scenario.md) 참고. 실제 수행한 E2E 테스트 결과는 `e2e/` 디렉토리 참고.
