# 스타일 가이드 - b2b-promo

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 1.0 | 2026-08-20 | 최초 작성 (실제 화면 캡처 3종 기반: 로그인, 프로모션 등록 폼, 프로모션 목록) |

## 문서 목적

`7-wireframe.md`가 화면 구성/배치를 다룬다면, 이 문서는 색상·타이포그래피·컴포넌트 스타일(버튼/인풋/카드/배지/내비게이션)을 정의한다. 프론트엔드는 React 19 + 순수 CSS(`5-project-principle.md` 기준 별도 CSS 프레임워크 미도입)이므로, 아래 토큰을 CSS 커스텀 프로퍼티(`:root` 변수)로 그대로 옮겨 쓰는 것을 전제로 작성했다. 정교한 디자인 시스템(다크모드, 애니메이션 명세 등)은 이 MVP 범위 밖이며, 실제 화면 캡처에서 확인 가능한 스타일만 정의한다(오버엔지니어링 금지, CLAUDE.md).

---

## 1. 브랜드 아이덴티티

- **서비스명**: CJ-Promo
- **로고 표현**: 별도 이미지 로고 없이 텍스트 로고. 로그인 화면에서는 그린 컬러의 볼드 텍스트(중앙 정렬), 내비게이션 바에서는 화이트 텍스트(좌측 정렬)
- **톤앤매너**: B2B 업무용 도구. 화려한 장식 없이 여백과 카드 구분으로 정보를 나누는 담백한 스타일

---

## 2. 색상 팔레트

### 2.1 기본 토큰

| 토큰 | 값 | 용도 |
|---|---|---|
| `--color-primary` | `#178a4f` | 브랜드 그린 — 로고 텍스트, 내비게이션 바 배경, 기본 버튼, 포커스 테두리 |
| `--color-primary-hover` | `#136e3f` | 버튼 hover/active |
| `--color-bg` | `#f5f6f8` | 페이지 배경(로그인/목록 화면 바탕) |
| `--color-surface` | `#ffffff` | 카드/폼/인풋 배경 |
| `--color-border` | `#dcdfe4` | 인풋/카드 기본 테두리 |
| `--color-text` | `#1a1a1a` | 기본 본문/제목 텍스트 |
| `--color-text-muted` | `#6b7280` | 보조 텍스트(기간, 라벨 등 부가정보) |
| `--color-link` | `#2563eb` | 텍스트 링크(예: "회원가입") — 브랜드 그린과 구분되는 표준 링크 블루 |

### 2.2 상태/배지 색상 (프로모션 상태·유형)

와이어프레임/도메인 정의서의 상태값(`scheduled|active|ended`, 유형 `discount|gift|tasting`)과 1:1 매핑한다.

| 배지 | 배경 | 텍스트 | 비고 |
|---|---|---|---|
| 진행중 (`active`) | `#dcfce7` | `#166534` | 연한 그린 필(pill) |
| 예정 (`scheduled`) | `#f3f4f6` | `#4b5563` | 연한 그레이 필 |
| 종료 (`ended`) | `#f3f4f6` | `#9ca3af` | 예정과 동일 톤이되 더 옅게(비활성 인상) |
| 가격할인 (`discount`) | `#ffe4e6` | `#9f1239` | 로즈 필 |
| 사은품증정 (`gift`) | `#ffedd5` | `#9a3412` | 오렌지 필 |
| 신제품시식 (`tasting`) | `#dbeafe` | `#1e40af` | 블루 필 |
| `[게임]` 표시 | 배경 없음(투명) | `#7c3aed` | 필이 아닌 대괄호 텍스트, 게임(룰렛) 적용 프로모션에만 카드 배지 옆에 병기 |

### 2.3 시맨틱 색상

| 토큰 | 값 | 용도 |
|---|---|---|
| `--color-danger` | `#dc2626` | 에러 메시지, 취소/삭제류 보조 버튼 텍스트 |
| `--color-focus-ring` | `#178a4f` | 인풋 focus 시 테두리(포커스된 비밀번호 필드에서 확인됨) |

### 2.4 네이티브 폼 컨트롤 예외

라디오 버튼(유형 선택)·체크박스(게임 적용 여부)·`<input type="date">`의 캘린더 아이콘은 브라우저 기본 accent color(블루 계열)를 그대로 사용한다. 커스텀 스타일링을 하지 않는다 — 네이티브 컨트롤 재구현은 이 프로젝트 규모에서 얻는 이득이 없다(오버엔지니어링 금지, `5-project-principle.md` 1절과 동일 원칙).

---

## 3. 타이포그래피

- **폰트**: 시스템 폰트 스택 사용(웹폰트 로드 없음) — `-apple-system, BlinkMacSystemFont, "Segoe UI", "Malgun Gothic", sans-serif`
- **크기/굵기**

| 용도 | 크기 | 굵기 |
|---|---|---|
| 브랜드 로고(로그인) | 24px | 700 |
| 브랜드 로고(내비게이션) | 18px | 700 |
| 페이지/카드 타이틀(예: "로그인", "진행중인 프로모션") | 20px | 700 |
| 프로모션 카드 제목 | 16px | 600 |
| 폼 라벨 | 14px | 600 |
| 본문/인풋 텍스트 | 15px | 400 |
| 보조 텍스트(기간, 배지) | 12–13px | 400–500 |

---

## 4. 여백·모서리·그림자

| 토큰 | 값 |
|---|---|
| `--radius-card` | 12px (로그인 카드, 프로모션 카드) |
| `--radius-input` | 8px (인풋, 버튼) |
| `--radius-pill` | 999px (상태/유형 배지, 로그인·등록 버튼) |
| `--shadow-card` | `0 1px 3px rgba(0,0,0,0.08)` |
| `--space-page-padding` | 24px (페이지 좌우 여백) |
| `--space-card-padding` | 24–32px (카드 내부 여백) |
| `--space-field-gap` | 16px (폼 필드 간 간격) |

---

## 5. 컴포넌트 스타일

### 5.1 버튼 (`components/common/Button.jsx`)

- **Primary**(로그인, 등록/저장): `background: var(--color-primary)`, 흰 텍스트, `border-radius: var(--radius-pill)`, 가로 100% 채움, 높이 44–48px, hover 시 `--color-primary-hover`
- **Secondary/Outline**(경품 "삭제", "경품 추가"): 흰 배경 + `1px solid var(--color-border)`, 텍스트는 `--color-text`, `border-radius: var(--radius-input)`

### 5.2 인풋 (`<input>`, `<textarea>`)

- 기본: `background: var(--color-surface)`, `1px solid var(--color-border)`, `border-radius: var(--radius-input)`, padding 10–12px
- Focus: 테두리를 `var(--color-focus-ring)`(그린)로 전환, `box-shadow: 0 0 0 1px var(--color-focus-ring)`로 이중 강조
- Placeholder/입력값 텍스트는 `--color-text` 유지(별도 회색 처리 없음)

### 5.3 카드 (`PromotionCard.jsx`, 로그인 카드)

- `background: var(--color-surface)`, `border-radius: var(--radius-card)`, `box-shadow: var(--shadow-card)`, padding `var(--space-card-padding)`
- 프로모션 카드 내부 순서: 배지 행(상태 + 유형 + `[게임]`) → 제목(굵게) → 기간(회색 보조 텍스트)

### 5.4 배지 (`Badge` 공용 컴포넌트)

- `display: inline-block`, `padding: 2px 10px`, `border-radius: var(--radius-pill)`, `font-size: 12px`, `font-weight: 500`
- 색상은 2.2절 표를 그대로 매핑(상태/유형 값 → 배경·텍스트 색 딕셔너리 하나로 관리, 조건 분기 최소화)

### 5.5 내비게이션 바 (`Header.jsx`)

- `background: var(--color-primary)`, 높이 56px, 좌측에 로고(흰 텍스트) + 메뉴("프로모션", "내 신청" — 관리자는 다른 메뉴 구성), 우측에 사용자명 드롭다운(흰 텍스트, `▾` 아이콘)
- 메뉴/사용자명 텍스트는 흰색, hover 시 밑줄 또는 투명도 조절 정도로 최소 처리

### 5.6 폼 레이아웃(관리자 등록/수정 폼)

- 라벨은 인풋 위에 배치(라벨-인풋 세로 스택), 라벨과 인풋 사이 4–6px
- 경품 목록의 각 항목은 인풋 + "삭제" 버튼을 한 행에 가로 배치(인풋이 남은 폭을 채움, 버튼은 고정 폭)
- 시작일/종료일처럼 대응되는 두 필드는 2열 그리드로 나란히 배치

---

## 6. CSS 커스텀 프로퍼티 (그대로 복사해 `index.css` 등에 사용)

```css
:root {
  /* 색상 */
  --color-primary: #178a4f;
  --color-primary-hover: #136e3f;
  --color-bg: #f5f6f8;
  --color-surface: #ffffff;
  --color-border: #dcdfe4;
  --color-text: #1a1a1a;
  --color-text-muted: #6b7280;
  --color-link: #2563eb;
  --color-danger: #dc2626;
  --color-focus-ring: #178a4f;

  /* 배지: 상태 */
  --badge-active-bg: #dcfce7;
  --badge-active-text: #166534;
  --badge-scheduled-bg: #f3f4f6;
  --badge-scheduled-text: #4b5563;
  --badge-ended-bg: #f3f4f6;
  --badge-ended-text: #9ca3af;

  /* 배지: 유형 */
  --badge-discount-bg: #ffe4e6;
  --badge-discount-text: #9f1239;
  --badge-gift-bg: #ffedd5;
  --badge-gift-text: #9a3412;
  --badge-tasting-bg: #dbeafe;
  --badge-tasting-text: #1e40af;
  --badge-game-text: #7c3aed;

  /* 모서리/그림자 */
  --radius-card: 12px;
  --radius-input: 8px;
  --radius-pill: 999px;
  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.08);

  /* 여백 */
  --space-page-padding: 24px;
  --space-card-padding: 24px;
  --space-field-gap: 16px;

  /* 폰트 */
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Malgun Gothic", sans-serif;
}

body {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-family);
}
```

---

## 7. 적용 원칙

- 색상/모서리/여백 값은 위 CSS 변수로만 참조한다. 컴포넌트 파일에 하드코딩된 hex 값을 넣지 않는다(변경 시 한 곳만 고치기 위함).
- 배지 색상 매핑(상태 4종 + 유형 3종)은 `components/common/Badge.jsx` 한 곳에 딕셔너리로 두고, 각 카드/목록 컴포넌트는 상태·유형 값만 넘긴다(조건문 중복 방지).
- 이 문서에 없는 스타일 판단이 필요하면(예: 에러 토스트, 로딩 스피너) 위 팔레트·타이포그래피 토큰의 연장선에서 가장 단순한 형태로 결정하고, 필요 시 이 문서에 추가한다.
