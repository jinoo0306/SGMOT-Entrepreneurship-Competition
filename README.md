```
# 클로바노트 클론 README (업데이트: Next.js 16, Yarn, Zustand, 풀스택)

본 문서는 클로바노트 스타일의 음성 전사 기반 노트 서비스 클론을 Next.js 16, Tailwind CSS, TanStack Query, Zustand로 **풀스택**(Next.js Route Handlers 기반 백엔드 포함) 구현하기 위한 상세 가이드입니다.

---

## 1. 프로젝트 개요

- 목적
  - 음성 파일 녹음 또는 업로드
  - 비동기 전사 처리 요청 및 진행 상태 표시
  - 전사 결과를 포함한 노트 작성, 태그, 폴더, 검색, 즐겨찾기
  - 노트 공유 링크 발급
- 범위
  - MVP 필수: 가입 로그인, 녹음 업로드, 전사 Job 생성 및 상태 폴링, 노트 CRUD, 검색, 공유
  - 확장 옵션: 요약 생성, 화자 분리 표기, 키워드 하이라이트, 다국어 전사
- 아키텍처
  - **풀스택 단일 리포지토리**: App Router + Route Handlers(API) + Prisma(데이터) + 서버 액션(선택)
  - 전사 엔진은 초기 Mock → 실제 프로바이더 어댑터 교체 가능한 인터페이스

---

## 2. 기술 스택 및 버전

- Frontend
  - **Next.js 16 App Router**
  - TypeScript 5.x
  - Tailwind CSS
  - TanStack Query v5
  - **Zustand**(전역 UI 상태)
  - shadcn UI 선택
- Backend (동일 Next.js 프로젝트 내 풀스택)
  - Next.js **Route Handlers**로 REST API 구현
  - Prisma ORM + SQLite 개발, PostgreSQL 운영 권장
  - Zod로 입력 검증
  - 서버 액션(선택) 및 백그라운드 Job 시뮬레이션(Mock 워커)
- 품질
  - ESLint + Prettier
  - Playwright E2E, Vitest 단위 테스트
- 배포
  - Vercel 기본 가정(Edge가 아닌 Node 런타임 모드 권장)

---

## 3. 주요 기능 흐름

1) 사용자는 오디오를 녹음하거나 파일 업로드  
2) 서버는 전사 Job을 생성하고 큐에 등록(Mock)  
3) 워커 시뮬레이터가 상태를 PENDING → PROCESSING → SUCCEEDED로 전이  
4) 전사 완료 후 노트 본문에 텍스트 저장  
5) 사용자는 노트 제목, 내용, 태그 편집  
6) 검색 바에서 전체 텍스트 검색  
7) 공유 링크 생성 시 공개 읽기 전용 페이지 제공

---

## 4. 폴더 구조

```

clova-note-clone/
.env
.env.local
package.json
yarn.lock
tsconfig.json
next.config.js
postcss.config.js
tailwind.config.ts
prisma/
schema.prisma
seed.ts
src/
app/
layout.tsx
globals.css
page.tsx
(auth)/
signin/page.tsx
signup/page.tsx
callback/route.ts
dashboard/page.tsx
notes/
page.tsx
new/page.tsx
[id]/page.tsx
[id]/share/page.tsx
record/page.tsx
search/page.tsx
settings/page.tsx
api/
auth/
session/route.ts
signin/route.ts
signup/route.ts
signout/route.ts
notes/route.ts
notes/[id]/route.ts
notes/[id]/share/route.ts
tags/route.ts
folders/route.ts
transcribe/route.ts
jobs/[id]/route.ts
components/
ui/...
note/
NoteEditor.tsx
NoteCard.tsx
TagInput.tsx
Toolbar.tsx
record/
Recorder.tsx
Waveform.tsx
common/
Header.tsx
Sidebar.tsx
SearchInput.tsx
EmptyState.tsx
lib/
db.ts
auth.ts
queryClient.ts
logger.ts
env.ts
transcription/
adapter.ts
mockAdapter.ts
providerAAdapter.ts
hooks/
useRecorder.ts
useDebounce.ts
queries/
notes.ts
tags.ts
folders.ts
jobs.ts
store/
uiStore.ts           // **Zustand 전역 UI 상태**
editorStore.ts       // **Zustand 에디터 상태**
styles/
prose.css

````

---

## 5. 데이터 모델(Prisma)

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  passwordHash  String
  notes         Note[]
  tags          Tag[]
  folders       Folder[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Note {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  title         String
  content       String
  summary       String?
  isFavorite    Boolean  @default(false)
  folderId      String?
  folder        Folder?  @relation(fields: [folderId], references: [id])
  tags          NoteTag[]
  shared        Boolean  @default(false)
  sharedSlug    String?  @unique
  audioUrl      String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Tag {
  id       String   @id @default(cuid())
  userId   String
  user     User     @relation(fields: [userId], references: [id])
  name     String
  notes    NoteTag[]
  @@unique([userId, name])
}

model NoteTag {
  noteId String
  tagId  String
  note   Note @relation(fields: [noteId], references: [id])
  tag    Tag  @relation(fields: [tagId], references: [id])
  @@id([noteId, tagId])
}

model Folder {
  id      String  @id @default(cuid())
  userId  String
  user    User    @relation(fields: [userId], references: [id])
  name    String
  @@unique([userId, name])
}

model TranscriptionJob {
  id         String    @id @default(cuid())
  userId     String
  user       User      @relation(fields: [userId], references: [id])
  noteId     String?
  note       Note?     @relation(fields: [noteId], references: [id])
  status     JobStatus @default(PENDING)
  sourceType String
  audioUrl   String
  language   String
  error      String?
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
}

enum JobStatus {
  PENDING
  PROCESSING
  SUCCEEDED
  FAILED
}
````

---

## 6. 라우팅 명세

* Pages

  * GET  /dashboard
  * GET  /notes
  * GET  /notes/new
  * GET  /notes/[id]
  * GET  /notes/[id]/share
  * GET  /record
  * GET  /search
  * GET  /settings
  * GET  /(auth)/signin
  * GET  /(auth)/signup
* API(Route Handlers)

  * POST /api/auth/signin
  * POST /api/auth/signup
  * POST /api/auth/signout
  * GET  /api/auth/session
  * GET  /api/notes
  * POST /api/notes
  * GET  /api/notes/[id]
  * PATCH /api/notes/[id]
  * DELETE /api/notes/[id]
  * POST /api/notes/[id]/share
  * GET  /api/tags
  * POST /api/tags
  * GET  /api/folders
  * POST /api/folders
  * POST /api/transcribe
  * GET  /api/jobs/[id]

---

## 7. React Query 키 및 **Zustand** 전역 상태

* React Query

  * notes: ['notes', {q, tag, folder, favorite, sort, page}]
  * note detail: ['note', id]
  * tags: ['tags']
  * folders: ['folders']
  * jobs: ['job', id]
  * session: ['session']
* Zustand 예시

  * `store/uiStore.ts`

    * sidebarOpen, theme, toastQueue
  * `store/editorStore.ts`

    * currentNoteId, titleDraft, contentDraft, dirty, autosaveTick

---

## 8. 설치 및 실행(Yarn)

```bash
# 의존성
yarn

# Prisma
yarn prisma generate
yarn prisma migrate dev --name init
yarn tsx prisma/seed.ts

# 개발 서버
yarn dev
```

* Playwright

  ```bash
  yarn playwright install
  yarn test:e2e
  ```

---

## 9. 패키지 설치 명령(Yarn)

```bash
yarn add @tanstack/react-query @tanstack/react-query-devtools zod zustand class-variance-authority clsx prisma @prisma/client bcrypt jsonwebtoken jose
yarn add -D prisma tsx vitest @vitest/ui @testing-library/react @testing-library/jest-dom @types/bcrypt @types/jsonwebtoken @types/node playwright @playwright/test eslint-config-next prettier prettier-plugin-tailwindcss
```

---

## 10. 인증 전략
- 이메일+비밀번호 기반 세션 쿠키
- 보호 경로: /dashboard, /notes, /record, /search, /settings, 대부분의 /api
- 공유 페이지는 공개 접근 허용(/notes/[id]/share)

+ 소셜 로그인 기반 세션 인증 (NextAuth.js 사용)
+ 지원 프로바이더: Google, GitHub (필요시 Kakao 추가 가능)
+ NextAuth Route: /api/auth/[...nextauth]/route.ts 자동 생성
+ 세션/보호 경로 유지 원칙 동일
+ 사용자 최초 로그인 시 User 테이블 자동 생성 및 동기화
+ 환경변수 예시
+ ```
+ GOOGLE_CLIENT_ID="..."
+ GOOGLE_CLIENT_SECRET="..."
+ GITHUB_ID="..."
+ GITHUB_SECRET="..."
+ NEXTAUTH_SECRET="..."
+ NEXTAUTH_URL="http://localhost:3000"
+ ```
+
+ 클라이언트에서는 `useSession()` 훅으로 로그인 상태 관리
+ 로그인 버튼은 `<SignInButton provider="google" />`, `<SignOutButton />` 형태로 구현


---

## 11. 환경변수

```
DATABASE_URL="file:./dev.db"
POSTGRES_URL=""
SESSION_SECRET="replace-with-strong"
STORAGE_BASE_URL="https://storage.example.com"
TRANSCRIPTION_PROVIDER="mock"
PROVIDER_A_API_KEY=""
```

---

## 12. 풀스택 백엔드 세부

* **Route Handlers**에서 Prisma 사용하여 CRUD 및 인증 처리
* 전사 Job

  * POST /api/transcribe: Job 생성
  * GET  /api/jobs/[id]: 상태 조회(React Query 폴링)
  * `src/lib/transcription/*` 어댑터로 Mock/실제 프로바이더 교체
* 입력 검증: Zod 스키마로 서버 측 검증
* 서버 액션(선택): 에디터 자동저장 등 서버 사이드 뮤테이션 간소화 가능

---

## 13. Mock 전사 어댑터(요약)

```ts
// src/lib/transcription/adapter.ts
export type TranscribeRequest = { audioUrl: string; language: string }
export type TranscribeResult = { text: string }
export interface TranscriptionAdapter {
  submit(req: TranscribeRequest): Promise<{ jobId: string }>
  get(jobId: string): Promise<{
    status: 'PENDING'|'PROCESSING'|'SUCCEEDED'|'FAILED'
    text?: string
  }>
}
```

---

## 14. 테스트 시나리오

* 가입/로그인 성공 실패
* 녹음 업로드 → 전사 Job 생성 → 폴링 완료
* 노트 CRUD 및 태그/폴더 연결
* 공유 링크 접근 제어
* 검색 하이라이트 노출
* Zustand 에디터 draft → 저장 → Query 무효화

---

## 15. 배포

* Vercel 환경 변수 설정
* 데이터베이스 운영 전환: PostgreSQL
* `yarn prisma migrate deploy`
* Node 런타임 모드로 Route Handlers 실행(Edge 비권장)

---

## 16. Cursor 작업 지시 템플릿(수정판)

1. Next.js 16 TypeScript + Tailwind 템플릿 프로젝트 생성
2. README 폴더 구조대로 디렉토리/파일 생성
3. Tailwind 설정(globals.css, tailwind.config.ts)
4. Prisma 스키마 작성 후 `yarn prisma migrate dev`
5. `src/lib`(env, db, auth, transcription 어댑터) 구현
6. API(Route Handlers) 구현: auth, notes, tags, folders, transcribe, jobs
7. React Query Provider와 **Zustand** 스토어 세팅
8. 레이아웃/공통 컴포넌트(Sidebar, Header 등)
9. 페이지 구현(dashboard, notes, note detail, record, search, settings, auth)
10. 전사 Job 폴링 및 완료 처리
11. 기본 E2E/단위 테스트 추가
12. Vercel 배포 설정 및 ENV 바인딩

```
```

## 17. 스타일 가이드
- Tailwind 유틸 중심
- 글꼴 시스템 폰트
- 다크모드 지원 class 전략
- 컨테이너 폭 max-w-7xl
- 폼 구성 요소는 shadcn ui 사용 선택 가능

+ **클로바노트 유사 디자인 가이드**
+ - 컬러 팔레트: 배경 #F9FAFB, 주요 색상 #2F80ED (Clova Blue)
+ - 기본 폰트: Pretendard
+ - 카드형 레이아웃, 좌측 사이드바 고정
+ - 버튼/입력창 모두 Tailwind 커스텀 스타일로 Clova UI와 유사한 라운드 모양
+ - 아이콘: lucide-react 활용, Clova와 유사한 간결한 모노라인 스타일
+ - 페이지별 주요 색상 포인트는 ClovaNote 앱을 참조 (녹음 버튼, 전사 진행 표시 등)
+ - shadcn/ui 컴포넌트는 theme="zinc" 기반으로 커스터마이징
