import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo user
  const passwordHash = await bcrypt.hash('password123', 12)
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: '데모 사용자',
      passwordHash,
    },
  })

  console.log('✅ Created demo user:', user.email)

  // Create folders
  const folders = await Promise.all([
    prisma.folder.upsert({
      where: { userId_name: { userId: user.id, name: '회의록' } },
      update: {},
      create: { userId: user.id, name: '회의록' },
    }),
    prisma.folder.upsert({
      where: { userId_name: { userId: user.id, name: '아이디어' } },
      update: {},
      create: { userId: user.id, name: '아이디어' },
    }),
    prisma.folder.upsert({
      where: { userId_name: { userId: user.id, name: '학습 노트' } },
      update: {},
      create: { userId: user.id, name: '학습 노트' },
    }),
  ])

  console.log('✅ Created folders:', folders.length)

  // Create tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { userId_name: { userId: user.id, name: '중요' } },
      update: {},
      create: { userId: user.id, name: '중요', color: '#EF4444' },
    }),
    prisma.tag.upsert({
      where: { userId_name: { userId: user.id, name: '업무' } },
      update: {},
      create: { userId: user.id, name: '업무', color: '#2F80ED' },
    }),
    prisma.tag.upsert({
      where: { userId_name: { userId: user.id, name: '개인' } },
      update: {},
      create: { userId: user.id, name: '개인', color: '#10B981' },
    }),
    prisma.tag.upsert({
      where: { userId_name: { userId: user.id, name: '프로젝트' } },
      update: {},
      create: { userId: user.id, name: '프로젝트', color: '#8B5CF6' },
    }),
  ])

  console.log('✅ Created tags:', tags.length)

  // Create sample notes
  const notes = await Promise.all([
    prisma.note.create({
      data: {
        userId: user.id,
        title: '팀 미팅 회의록',
        content: `오늘 팀 미팅에서 논의된 내용:

1. 프로젝트 진행 상황 점검
   - API 개발 완료
   - 프론트엔드 80% 완성
   - 테스트 코드 작성 중

2. 다음 주 목표
   - 베타 버전 릴리스
   - 사용자 피드백 수집
   - 버그 수정

3. 기타 논의사항
   - 디자인 시스템 업데이트
   - 문서화 작업 필요`,
        folderId: folders[0].id,
        isFavorite: true,
      },
    }),
    prisma.note.create({
      data: {
        userId: user.id,
        title: '새로운 기능 아이디어',
        content: `앱 개선을 위한 아이디어 목록:

- 음성 메모 자동 요약 기능
- 태그 기반 자동 분류
- 팀원과 노트 공유
- 오프라인 모드 지원
- 다국어 전사 지원
- 화자 분리 기능
- 키워드 하이라이트
- 음성 검색`,
        folderId: folders[1].id,
      },
    }),
    prisma.note.create({
      data: {
        userId: user.id,
        title: 'React 학습 노트',
        content: `React 핵심 개념 정리:

1. 컴포넌트와 Props
   - 함수형 컴포넌트 권장
   - Props는 읽기 전용

2. State와 생명주기
   - useState로 상태 관리
   - useEffect로 사이드 이펙트 처리

3. 훅(Hooks)
   - useState: 상태 관리
   - useEffect: 생명주기
   - useContext: 전역 상태
   - useRef: DOM 참조
   - useMemo: 메모이제이션
   - useCallback: 함수 메모이제이션`,
        folderId: folders[2].id,
        isFavorite: true,
      },
    }),
    prisma.note.create({
      data: {
        userId: user.id,
        title: '독서 메모: 클린 코드',
        content: `"클린 코드" 책을 읽고 정리한 내용:

좋은 코드의 특징:
- 읽기 쉽다
- 의도가 명확하다
- 중복이 없다
- 테스트가 있다

명명 규칙:
- 의도를 분명히 밝혀라
- 그릇된 정보를 피하라
- 의미있게 구분하라
- 검색하기 쉬운 이름을 사용하라

함수:
- 작게 만들어라
- 한 가지만 해라
- 함수 당 추상화 수준은 하나로
- 서술적인 이름을 사용하라`,
      },
    }),
  ])

  console.log('✅ Created notes:', notes.length)

  // Add tags to notes
  const noteTagData = [
    { noteId: notes[0].id, tagId: tags[1].id }, // 회의록 - 업무
    { noteId: notes[0].id, tagId: tags[0].id }, // 회의록 - 중요
    { noteId: notes[1].id, tagId: tags[3].id }, // 아이디어 - 프로젝트
    { noteId: notes[2].id, tagId: tags[2].id }, // React 학습 - 개인
    { noteId: notes[3].id, tagId: tags[2].id }, // 독서 메모 - 개인
  ]

  for (const data of noteTagData) {
    await prisma.noteTag.upsert({
      where: { noteId_tagId: data },
      update: {},
      create: data,
    })
  }

  console.log('✅ Added tags to notes')

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

