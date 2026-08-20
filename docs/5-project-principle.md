# 프로젝트 구조 설계 원칙 - b2b-promo

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 1.0 | 2026-08-13 | 최초 작성 |
| 1.1 | 2026-08-13 | 백엔드 디렉토리 구조에 refresh token 마이그레이션 파일 추가 |
| 1.2 | 2026-08-13 | docs 간 정합성 점검 반영: 에러 핸들링 규칙에 권한 없음(403) 추가 (swagger.json의 Forbidden 응답 및 9-plan.md의 role 차단 Task와 정합) |

## 문서 목적

`1-domain-definition.md`, `2-usecase.md`, `3-prd.md`, `4-user-scenario.md`에서 정의한 도메인/요구사항을 3일/1인 개발 MVP 규모로 구현하기 위한 구조 설계 원칙을 정한다. Clean Architecture, DDD 등 무거운 패턴은 이 프로젝트 규모에 맞지 않으므로 채택하지 않는다.

---

## 1. 공통 최상위 원칙

- **단순성 우선**: 동작하는 가장 단순한 구조를 선택한다. 미래 확장을 가정한 선제적 추상화는 만들지 않는다 (오버엔지니어링 금지, CLAUDE.md)
- **관심사 분리**: UI/상태/통신, 라우팅/비즈니스로직/DB접근처럼 성격이 다른 코드는 분리해 한 파일이 여러 책임을 갖지 않게 한다 (변경 영향 범위를 좁히기 위함)
- **명시적 설정**: 매직넘버·암묵적 규칙 대신 상수와 명시적 분기로 표현한다 (BR-1~4처럼 코드로 옮겨야 하는 규칙이 많아 가독성이 곧 정확성)
- **얕은 구조**: 폴더 depth는 2~3단계를 넘기지 않는다 (파일 찾는 데 드는 시간이 원가)
- **도메인 4종 기준 정렬**: User/Promotion/Prize/Application 4개 엔티티를 기준으로 폴더·모듈을 나눈다 (도메인 정의서와 코드 구조를 1:1로 대응시켜 이해 비용을 줄임)
- **재사용 가능한 것부터 사용**: 새 라이브러리 도입 전 이미 선정된 스택(pg, Express, Zustand, TanStack Query)의 기본 기능으로 해결 가능한지 먼저 검토한다

---

## 2. 의존성/레이어 원칙

### 프론트엔드
- **UI - 상태 - API 통신 3계층 분리**: 컴포넌트(UI)는 화면 렌더링만, Zustand는 클라이언트 전역 상태만, TanStack Query는 서버 데이터 요청/캐싱만 담당한다 (책임이 섞이면 어디를 고쳐야 할지 추측하게 됨)
- **Zustand 역할**: 로그인 사용자 정보, 액세스 토큰 등 여러 화면이 공유하는 클라이언트 상태만 둔다. 서버에서 온 데이터(프로모션 목록 등)는 Zustand에 복제하지 않는다 (서버 상태를 두 곳에 동기화하면 불일치가 생김)
- **TanStack Query 역할**: 프로모션/신청/유저 목록 등 서버 데이터의 조회(query)·변경(mutation)·캐싱·재요청을 전담한다 (로딩/에러/캐시 처리를 직접 구현하지 않기 위함)
- **컴포넌트는 훅을 통해서만 데이터 접근**: 컴포넌트에서 axios/fetch를 직접 호출하지 않고 `useXxxQuery`/`useXxxMutation` 커스텀 훅을 통해서만 접근한다 (API 호출 로직 중복 방지)
- **의존 방향**: `pages/컴포넌트 → hooks(api) → api client`, `pages/컴포넌트 → store(zustand)` 순으로만 의존한다. 역방향 의존(훅이 컴포넌트를 참조 등) 금지

### 백엔드
- **라우트 - 컨트롤러 - 서비스 - DB접근 4계층 분리**: 라우트(URL/미들웨어 연결) → 컨트롤러(요청/응답 변환) → 서비스(비즈니스 규칙, BR-1~4) → DB접근(SQL 실행)만 순서대로 의존한다
- **순환 의존 금지**: 하위 계층(DB접근)은 상위 계층(서비스, 컨트롤러)을 절대 import하지 않는다
- **비즈니스 규칙은 서비스 계층에만**: BR-1(신청 유일성), BR-2(1회 추첨), BR-3(종료 프로모션 신청 불가), BR-4(상태 수동 전환)는 컨트롤러가 아닌 서비스 함수 안에서만 검증한다 (규칙이 여러 곳에 흩어지면 EX-1~5 처리가 누락되기 쉬움)
- **엔티티 단위 모듈화**: User/Promotion/Prize/Application 각각을 하나의 라우트+컨트롤러+서비스+DB접근 세트로 구성한다. Prize는 Promotion에 종속되므로 별도 라우트 없이 Promotion 서비스 내부에서 다룬다

---

## 3. 코드/네이밍 원칙

- **파일명**: 프론트엔드는 컴포넌트 `PascalCase.jsx`, 훅/유틸은 `camelCase.js`. 백엔드는 전 파일 `camelCase.js` (예: `promotionService.js`)
- **변수/함수명**: `camelCase`, 불리언은 `is/has` 접두사 (예: `isPublished`, `hasApplied`)
- **컴포넌트명**: 화면 단위는 `~Page` (예: `PromotionListPage`), 재사용 UI는 역할이 드러나는 명사 (예: `PromotionCard`, `RouletteModal`)
- **API 훅명**: `use + 동사/명사 + Query|Mutation` (예: `usePromotionListQuery`, `useApplyMutation`)
- **DB 테이블/컬럼명**: `snake_case`, 테이블명은 복수형 (예: `users`, `promotions`, `prizes`, `applications`), PK는 `id`, FK는 `{단수엔티티}_id` (예: `promotion_id`, `buyer_id`)
- **상태값(enum성 컬럼)**: 영문 소문자 고정 문자열 사용, 도메인 용어와 1:1 대응 — 프로모션 상태 `scheduled|active|ended`, 신청 상태 `applied|cancelled` (도메인 정의서의 "예정/진행/종료", "신청/취소"와 매핑을 코드 주석에 남긴다)
- **REST 엔드포인트**: `/api/{리소스 복수형}` (예: `POST /api/promotions`, `POST /api/promotions/:id/applications`)

---

## 4. 테스트/품질 원칙

- **피라미드 요구 금지, 규칙 커버리지만 목표**: 3일 MVP 규모이므로 유닛/통합/E2E 비율을 맞추지 않는다. BR-1~4와 EX-1~5를 검증하는 테스트만 작성한다
- **서비스 계층 위주 테스트**: 비즈니스 규칙이 모여 있는 서비스 함수(신청 생성, 추첨, 상태 전환)만 최소 테스트를 둔다. 컨트롤러/라우트/프론트 컴포넌트는 자동테스트 없이 수동 확인으로 대체한다
- **필수 검증 목록**: (1) 중복 신청 거부(BR-1/EX-1), (2) 재신청 시 레코드 재사용 및 재추첨(BR-1/BR-2), (3) 추첨 1회 확정 후 재조회 시 동일 결과 반환(BR-2), (4) 종료/미게시 프로모션 신청 거부(BR-3/EX-2), (5) 경품 없는 게임 프로모션 게시 거부(EX-3), (6) 이메일 중복 가입 거부(EX-5)
- **DB 유니크 제약을 1차 방어선으로**: BR-1은 `UNIQUE(promotion_id, buyer_id)` 제약이 최종 보증이며, 서비스 코드의 사전 체크는 사용자 메시지 개선용 보조 수단으로 취급한다 (PRD 5절 데이터 정합성 원칙)

---

## 5. 설정/보안/운영 원칙

- **환경변수**: DB 접속정보, JWT 시크릿, 토큰 만료시간은 `.env`로 관리하고 `.env`는 git에 커밋하지 않는다. `.env.example`만 커밋한다
- **JWT**: access token은 짧게(예: 15분), refresh token은 길게(예: 7일) 만료시간을 설정한다. refresh token은 DB(또는 별도 테이블)에 저장해 재발급 시 로테이션하고 로그아웃 시 무효화한다 (FR-1.4, FR-1.5)
- **비밀번호 해시**: bcrypt로 해시 저장, 평문 비밀번호는 로그를 포함해 어디에도 남기지 않는다
- **CORS**: 개발 중 프론트엔드 origin만 허용 목록에 등록한다. 와일드카드(`*`) 사용 금지
- **에러 핸들링**: Express 전역 에러 미들웨어 1곳에서 에러를 받아 일관된 JSON 형식(`{ error: message }`)으로 응답한다. 비즈니스 규칙 위반(BR-1~4)은 400, 인증 실패는 401, 권한 없음(role 불일치, 예: buyer의 관리자 API 접근)은 403, 존재하지 않는 리소스는 404로 구분한다
- **로깅**: 콘솔 로그 수준으로 충분하다 (요청 메서드/경로/응답코드, 에러 스택). 별도 로깅 인프라(ELK 등) 도입은 MVP 범위 밖
- **입력 검증**: 라우트 진입 시점에 필수 필드 존재 여부만 최소 검증한다. 별도 스키마 검증 라이브러리 도입은 필요 시점에 판단(현재는 과함)

---

## 6. 프론트엔드 디렉토리 구조

도메인 정의서 4장(유스케이스)의 화면 단위를 기준으로 구성한다.

```
frontend/
├── src/
│   ├── main.jsx
│   ├── App.jsx                    # 라우터 정의
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   └── SignupPage.jsx
│   │   ├── promotions/
│   │   │   ├── PromotionListPage.jsx      # 거래처: 목록 조회 (FR-3.1)
│   │   │   ├── PromotionDetailPage.jsx    # 거래처: 상세+신청 (FR-3.2)
│   │   │   ├── MyApplicationsPage.jsx     # 거래처: 신청 내역 (FR-3.4)
│   │   │   └── admin/
│   │   │       ├── PromotionAdminListPage.jsx   # 관리자: 목록+게시/종료 (FR-2.4)
│   │   │       ├── PromotionFormPage.jsx        # 관리자: 등록/수정 (FR-2.1, FR-2.3)
│   │   │       └── PromotionApplicantsPage.jsx  # 관리자: 참여 현황 (FR-2.5)
│   │   └── mypage/
│   │       └── MyPage.jsx         # 정보 수정/비밀번호 변경 (FR-4)
│   ├── components/
│   │   ├── common/                # Button, Modal 등 범용 UI
│   │   ├── promotion/
│   │   │   ├── PromotionCard.jsx
│   │   │   └── RouletteModal.jsx  # 게임 추첨 애니메이션 (BR-2)
│   │   └── layout/
│   │       ├── Header.jsx
│   │       └── ProtectedRoute.jsx # 비로그인 리다이렉트 (EX-4)
│   ├── hooks/                     # TanStack Query 훅 (서버 상태)
│   │   ├── useAuth.js
│   │   ├── usePromotions.js
│   │   └── useApplications.js
│   ├── store/                     # Zustand (클라이언트 상태)
│   │   └── authStore.js           # 로그인 사용자, access token
│   ├── api/                       # API 클라이언트
│   │   ├── client.js               # axios 인스턴스, 인터셉터(토큰 재발급)
│   │   ├── authApi.js
│   │   ├── promotionApi.js
│   │   └── applicationApi.js
│   └── utils/
│       └── validators.js
├── .env.example
└── package.json
```

---

## 7. 백엔드 디렉토리 구조

도메인 엔티티(User/Promotion/Prize/Application) 단위로 구성한다.

```
backend/
├── src/
│   ├── index.js                   # 서버 진입점
│   ├── app.js                     # Express 앱, 미들웨어, 라우터 연결
│   ├── db/
│   │   └── pool.js                # pg Pool 인스턴스
│   ├── middlewares/
│   │   ├── authMiddleware.js      # JWT 검증 (EX-4)
│   │   └── errorHandler.js        # 전역 에러 핸들러
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── promotionRoutes.js     # Prize 포함
│   │   ├── applicationRoutes.js
│   │   └── userRoutes.js          # 마이페이지
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── promotionController.js
│   │   ├── applicationController.js
│   │   └── userController.js
│   ├── services/
│   │   ├── authService.js         # 회원가입/로그인/토큰 재발급 (FR-1)
│   │   ├── promotionService.js    # 등록/수정/게시/종료, 경품 검증 (BR-4, EX-3)
│   │   ├── applicationService.js  # 신청/취소/추첨 (BR-1, BR-2, BR-3)
│   │   └── userService.js         # 내 정보/비밀번호 변경 (FR-4)
│   ├── repositories/              # DB 접근 (SQL 쿼리)
│   │   ├── userRepository.js
│   │   ├── promotionRepository.js
│   │   ├── prizeRepository.js
│   │   └── applicationRepository.js
│   ├── db-migrations/
│   │   ├── 001_create_users.sql
│   │   ├── 002_create_promotions.sql
│   │   ├── 003_create_prizes.sql
│   │   ├── 004_create_applications.sql   # UNIQUE(promotion_id, buyer_id) - BR-1
│   │   ├── 005_create_refresh_tokens.sql # refresh token 저장 (FR-1.4, FR-1.5)
│   │   └── seed_admin.sql                # 관리자 계정 시드 (FR-1.0)
│   └── utils/
│       ├── jwt.js
│       └── password.js            # bcrypt 해시/검증
├── .env.example
└── package.json
```
