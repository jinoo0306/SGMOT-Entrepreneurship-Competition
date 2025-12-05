// 전역 변수
let notes = [
    {
        id: 1,
        title: '환영합니다!',
        content: '<p>클로바노트에 오신 것을 환영합니다. 새 노트를 작성하거나 음성을 녹음해보세요.</p><p><br></p><p><strong>주요 기능:</strong></p><ul><li>텍스트 노트 작성</li><li>음성 녹음 및 텍스트 변환</li><li>자동 요약 기능</li><li>폴더 및 태그 관리</li></ul>',
        preview: '클로바노트에 오신 것을 환영합니다. 새 노트를 작성하거나 음성을 녹음해보세요.',
        date: '방금 전',
        tags: ['시작하기'],
        favorite: false,
        createdAt: new Date()
    }
];

let currentNoteId = 1;
let currentTab = 'write';
let isRecording = false;
let recordingTime = 0;
let recordingInterval = null;

// DOM 요소
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const newNoteBtn = document.getElementById('newNoteBtn');
const noteList = document.getElementById('noteList');
const editorTabs = document.querySelectorAll('.editor-tab');
const editorContents = document.querySelectorAll('.editor-content');
const noteTitleInput = document.querySelector('.note-title-input');
const editorArea = document.querySelector('.editor-area');
const recordBtn = document.getElementById('recordBtn');
const contextMenu = document.getElementById('contextMenu');

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    renderNoteList();
    setupEventListeners();
    updateNoteCounts();
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 메뉴 버튼
    menuBtn.addEventListener('click', toggleSidebar);
    
    // 새 노트 버튼
    newNoteBtn.addEventListener('click', createNewNote);
    
    // 에디터 탭
    editorTabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
    
    // 노트 제목/내용 변경 감지
    noteTitleInput.addEventListener('input', handleTitleChange);
    editorArea.addEventListener('input', handleContentChange);
    
    // 툴바 버튼
    setupToolbarButtons();
    
    // 녹음 버튼
    if (recordBtn) {
        recordBtn.addEventListener('click', toggleRecording);
    }
    
    // 컨텍스트 메뉴 닫기
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.context-menu') && !e.target.closest('.note-menu-btn')) {
            contextMenu.style.display = 'none';
        }
    });
    
    // 뷰 전환 버튼
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// 사이드바 토글
function toggleSidebar() {
    sidebar.classList.toggle('collapsed');
}

// 노트 목록 렌더링
function renderNoteList() {
    noteList.innerHTML = notes.map(note => `
        <div class="note-card" data-note-id="${note.id}" onclick="selectNote(${note.id})">
            <div class="note-card-header">
                <h3 class="note-title">${note.title}</h3>
                <button class="note-menu-btn" onclick="event.stopPropagation(); showContextMenu(event, ${note.id})">
                    <i class="fas fa-ellipsis-h"></i>
                </button>
            </div>
            <p class="note-preview">${note.preview}</p>
            <div class="note-card-footer">
                <span class="note-date">${note.date}</span>
                <div class="note-tags">
                    ${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// 노트 선택
function selectNote(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    
    currentNoteId = noteId;
    
    // 노트 카드 활성화
    document.querySelectorAll('.note-card').forEach(card => {
        card.classList.remove('active');
    });
    document.querySelector(`[data-note-id="${noteId}"]`)?.classList.add('active');
    
    // 에디터에 내용 표시
    noteTitleInput.value = note.title;
    editorArea.innerHTML = note.content;
    
    updateCharCount();
}

// 새 노트 생성
function createNewNote() {
    const newNote = {
        id: Date.now(),
        title: '제목 없음',
        content: '<p><br></p>',
        preview: '',
        date: '방금 전',
        tags: [],
        favorite: false,
        createdAt: new Date()
    };
    
    notes.unshift(newNote);
    renderNoteList();
    selectNote(newNote.id);
    updateNoteCounts();
    
    // 제목 입력에 포커스
    noteTitleInput.focus();
    noteTitleInput.select();
}

// 제목 변경 처리
function handleTitleChange(e) {
    const note = notes.find(n => n.id === currentNoteId);
    if (note) {
        note.title = e.target.value || '제목 없음';
        renderNoteList();
        selectNote(currentNoteId);
    }
}

// 내용 변경 처리
function handleContentChange() {
    const note = notes.find(n => n.id === currentNoteId);
    if (note) {
        note.content = editorArea.innerHTML;
        note.preview = editorArea.textContent.substring(0, 100);
        note.date = '방금 전';
        renderNoteList();
        selectNote(currentNoteId);
    }
    updateCharCount();
}

// 문자 수 업데이트
function updateCharCount() {
    const charCount = editorArea.textContent.length;
    const charCountEl = document.querySelector('.char-count');
    if (charCountEl) {
        charCountEl.textContent = `문자 수: ${charCount}`;
    }
}

// 탭 전환
function switchTab(tabName) {
    currentTab = tabName;
    
    // 탭 활성화
    editorTabs.forEach(tab => {
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // 콘텐츠 표시
    editorContents.forEach(content => {
        if (content.dataset.content === tabName) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
}

// 툴바 버튼 설정
function setupToolbarButtons() {
    const toolbarBtns = document.querySelectorAll('.toolbar-btn');
    
    toolbarBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const icon = btn.querySelector('i');
            
            if (icon.classList.contains('fa-bold')) {
                document.execCommand('bold', false, null);
            } else if (icon.classList.contains('fa-italic')) {
                document.execCommand('italic', false, null);
            } else if (icon.classList.contains('fa-underline')) {
                document.execCommand('underline', false, null);
            } else if (icon.classList.contains('fa-list-ul')) {
                document.execCommand('insertUnorderedList', false, null);
            } else if (icon.classList.contains('fa-list-ol')) {
                document.execCommand('insertOrderedList', false, null);
            } else if (icon.classList.contains('fa-link')) {
                const url = prompt('링크 URL을 입력하세요:');
                if (url) {
                    document.execCommand('createLink', false, url);
                }
            } else if (icon.classList.contains('fa-image')) {
                const url = prompt('이미지 URL을 입력하세요:');
                if (url) {
                    document.execCommand('insertImage', false, url);
                }
            }
            
            editorArea.focus();
        });
    });
}

// 녹음 토글
function toggleRecording() {
    if (!isRecording) {
        startRecording();
    } else {
        stopRecording();
    }
}

// 녹음 시작
function startRecording() {
    isRecording = true;
    recordingTime = 0;
    
    // UI 업데이트
    const recordIcon = document.querySelector('.record-icon');
    const recordStatus = document.querySelector('.record-status');
    const startBtn = document.querySelector('.start-record');
    const stopBtn = document.querySelector('.stop-record');
    
    recordIcon.style.animation = 'pulse 1.5s infinite';
    recordStatus.textContent = '녹음 중...';
    startBtn.style.display = 'none';
    stopBtn.style.display = 'flex';
    
    // 타이머 시작
    recordingInterval = setInterval(() => {
        recordingTime++;
        updateRecordingTime();
        
        // 시뮬레이션: 녹음 텍스트 추가
        if (recordingTime % 3 === 0) {
            addTranscriptText();
        }
    }, 1000);
}

// 녹음 중지
function stopRecording() {
    isRecording = false;
    
    // UI 업데이트
    const recordIcon = document.querySelector('.record-icon');
    const recordStatus = document.querySelector('.record-status');
    const startBtn = document.querySelector('.start-record');
    const stopBtn = document.querySelector('.stop-record');
    
    recordIcon.style.animation = '';
    recordStatus.textContent = '녹음 완료';
    startBtn.style.display = 'flex';
    stopBtn.style.display = 'none';
    
    // 타이머 정지
    if (recordingInterval) {
        clearInterval(recordingInterval);
        recordingInterval = null;
    }
}

// 녹음 시간 업데이트
function updateRecordingTime() {
    const hours = Math.floor(recordingTime / 3600);
    const minutes = Math.floor((recordingTime % 3600) / 60);
    const seconds = recordingTime % 60;
    
    const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    document.querySelector('.record-time').textContent = timeString;
}

// 변환 텍스트 추가 (시뮬레이션)
function addTranscriptText() {
    const sampleTexts = [
        '안녕하세요. ',
        '오늘 회의 내용을 요약하겠습니다. ',
        '첫 번째 안건은 신규 프로젝트에 관한 것입니다. ',
        '두 번째로 예산 관련 논의가 있었습니다. ',
        '마지막으로 일정을 조율했습니다. '
    ];
    
    const transcriptContent = document.querySelector('.transcript-content');
    const currentText = transcriptContent.textContent;
    
    if (currentText === '녹음을 시작하면 음성이 자동으로 텍스트로 변환됩니다.') {
        transcriptContent.textContent = '';
    }
    
    const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    transcriptContent.textContent += randomText;
}

// 컨텍스트 메뉴 표시
function showContextMenu(event, noteId) {
    event.preventDefault();
    
    const menu = document.getElementById('contextMenu');
    menu.style.display = 'block';
    menu.style.left = event.pageX + 'px';
    menu.style.top = event.pageY + 'px';
    
    // 메뉴 아이템 클릭 이벤트
    const menuItems = menu.querySelectorAll('.context-menu-item');
    menuItems.forEach(item => {
        item.onclick = () => {
            const itemText = item.querySelector('span').textContent;
            
            if (itemText === '삭제') {
                deleteNote(noteId);
            } else if (itemText === '즐겨찾기') {
                toggleFavorite(noteId);
            }
            
            menu.style.display = 'none';
        };
    });
}

// 노트 삭제
function deleteNote(noteId) {
    if (confirm('이 노트를 삭제하시겠습니까?')) {
        notes = notes.filter(n => n.id !== noteId);
        renderNoteList();
        updateNoteCounts();
        
        // 첫 번째 노트 선택
        if (notes.length > 0) {
            selectNote(notes[0].id);
        } else {
            // 노트가 없으면 새 노트 생성
            createNewNote();
        }
    }
}

// 즐겨찾기 토글
function toggleFavorite(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (note) {
        note.favorite = !note.favorite;
        renderNoteList();
        selectNote(currentNoteId);
    }
}

// 노트 개수 업데이트
function updateNoteCounts() {
    const allNotesCount = document.querySelector('.nav-item:nth-child(1) .count');
    const favoriteCount = document.querySelector('.nav-item:nth-child(2) .count');
    const recordCount = document.querySelector('.nav-item:nth-child(3) .count');
    
    if (allNotesCount) allNotesCount.textContent = notes.length;
    if (favoriteCount) favoriteCount.textContent = notes.filter(n => n.favorite).length;
    if (recordCount) recordCount.textContent = 0; // 녹음 노트는 별도 관리
}

// 요약 생성 버튼
const generateSummaryBtn = document.querySelector('.generate-summary-btn');
if (generateSummaryBtn) {
    generateSummaryBtn.addEventListener('click', generateSummary);
}

// 요약 생성 (시뮬레이션)
function generateSummary() {
    const summaryContent = document.querySelector('.summary-content');
    const keywordList = document.querySelector('.keyword-list');
    
    // 샘플 요약 텍스트
    summaryContent.innerHTML = `
        <div style="text-align: left; color: var(--text-primary); line-height: 1.8;">
            <h4 style="margin-bottom: 16px;">📌 주요 내용</h4>
            <p style="margin-bottom: 12px;">클로바노트는 텍스트 작성과 음성 녹음을 통합한 스마트 노트 앱입니다.</p>
            
            <h4 style="margin: 24px 0 16px 0;">✨ 핵심 기능</h4>
            <ul style="margin-left: 24px; margin-bottom: 12px;">
                <li>리치 텍스트 에디터로 자유로운 노트 작성</li>
                <li>음성 녹음 및 실시간 텍스트 변환</li>
                <li>AI 기반 자동 요약 및 키워드 추출</li>
                <li>폴더와 태그로 체계적인 관리</li>
            </ul>
            
            <h4 style="margin: 24px 0 16px 0;">🎯 활용 방법</h4>
            <p>회의록, 강의 노트, 아이디어 메모 등 다양한 상황에서 활용 가능합니다.</p>
        </div>
    `;
    
    // 샘플 키워드
    const keywords = ['노트', '녹음', 'AI', '요약', '텍스트', '관리', '회의록'];
    keywordList.innerHTML = keywords.map(keyword => 
        `<span class="tag">${keyword}</span>`
    ).join('');
}

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
            box-shadow: 0 10px 15px rgba(0,0,0,0.1);
        }
        50% {
            transform: scale(1.05);
            box-shadow: 0 15px 25px rgba(0, 199, 60, 0.3);
        }
    }
`;
document.head.appendChild(style);