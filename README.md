# ㈜거성스폰지 홈페이지

순수 HTML / CSS / JavaScript로 만든 원페이지 회사 홈페이지입니다.
빌드 과정이나 설치할 것 없이, 이 폴더를 그대로 올리면 바로 동작합니다.

---

## 📁 폴더 구조

```
geoseong-sponge-website/
├── index.html              ← 모든 텍스트·섹션 내용
├── assets/
│   ├── css/
│   │   ├── reset.css       ← 브라우저 기본값 초기화 (수정할 일 거의 없음)
│   │   ├── common.css      ← 브랜드 컬러, 폰트, 버튼, 스크롤 애니메이션
│   │   └── style.css       ← 섹션별 디자인 + 반응형
│   ├── js/
│   │   ├── config.js       ← ★ 메일 수신 키, 슬라이드 시간 설정
│   │   ├── main.js         ← 헤더, 슬라이드, 스크롤 애니메이션, 탭 등
│   │   └── contact.js      ← 견적 문의 폼 검사 + 메일 전송
│   └── images/             ← 사진 (같은 파일명으로 덮어쓰면 교체됨)
└── README.md
```

---

## ✉️ 1. 견적 문의 → 네이버 메일로 받기 (필수 설정)

서버 없이 메일을 보내기 위해 무료 서비스 **Web3Forms**를 사용합니다. (무료: 월 250건)

1. https://web3forms.com 접속
2. **Create your Access Key** 칸에 문의를 받을 **네이버 메일 주소** 입력
3. 네이버 메일함으로 온 **Access Key**를 복사
4. `assets/js/config.js` 파일을 열어 아래 부분에 붙여넣기

   ```js
   WEB3FORMS_ACCESS_KEY: '여기에-발급받은-키-붙여넣기',
   ```
5. 저장 후 푸시 → 사이트에서 테스트 문의를 한 번 보내보세요.

- 메일 제목과 보낸 사람 이름도 `config.js`에서 바꿀 수 있습니다.
- 받은 메일에서 **답장**을 누르면 문의한 고객 이메일로 바로 회신됩니다.
- 처음 몇 통은 네이버 **스팸함**에 들어갈 수 있으니 확인 후 "스팸 아님" 처리해 주세요.
- Access Key는 공개돼도 메일 주소가 노출되지 않는 공개용 키입니다.

---

## 🚀 2. 배포 + 도메인 연결

### 방법 A. GitHub Pages (무료, 추천)

1. GitHub에서 새 저장소(Repository) 생성
2. 이 폴더 안의 파일들을 저장소 **최상위**에 올리기 (`index.html`이 최상위에 있어야 함)

   ```bash
   cd geoseong-sponge-website
   git init
   git add .
   git commit -m "거성스폰지 홈페이지"
   git branch -M main
   git remote add origin https://github.com/아이디/저장소이름.git
   git push -u origin main
   ```
3. 저장소 **Settings → Pages** → Branch를 `main` / `/(root)`로 선택 후 Save
4. **Custom domain**에 구매한 도메인 입력 (예: `www.geoseong.co.kr`) → Save
   (저장소에 `CNAME` 파일이 자동으로 생깁니다)
5. 도메인 구매처(가비아, 후이즈 등) **DNS 설정**에서:

   | 타입 | 호스트 | 값 |
   |---|---|---|
   | A | @ | 185.199.108.153 |
   | A | @ | 185.199.109.153 |
   | A | @ | 185.199.110.153 |
   | A | @ | 185.199.111.153 |
   | CNAME | www | `아이디.github.io` |

6. 반영까지 보통 10분 ~ 최대 24시간. 이후 Pages 설정에서 **Enforce HTTPS** 체크

### 방법 B. Netlify / Vercel

- GitHub 저장소를 연결하거나 폴더를 드래그&드롭하면 끝입니다. (빌드 명령어 없음, 배포 폴더는 루트)
- 각 서비스의 **Domain settings**에서 도메인을 추가하면 DNS에 넣을 값을 알려줍니다.

---

## ✏️ 3. 자주 하는 수정

| 하고 싶은 것 | 어디서 |
|---|---|
| 문구, 연락처, 주소 수정 | `index.html` |
| 메인 슬라이드 사진 교체 | `assets/images/hero-1.jpg`, `hero-2.jpg`를 같은 이름으로 덮어쓰기 |
| 메인 슬라이드 추가 | `index.html`의 `.hero__slide` 블록 복사 + 아래 `.hero__dot` 버튼도 1개 추가 |
| 슬라이드 전환 시간 | `config.js`의 `HERO_INTERVAL` (6000 = 6초) |
| 브랜드 컬러 변경 | `common.css` 맨 위 `:root`의 `--navy-900`, `--accent` 등 |
| 설비 / 파트너 추가 | `index.html`에서 해당 `<li>` 블록 복사 |
| 숫자 카운트 값 | `index.html`의 `data-count="12000"` 값 |
| 스크롤 등장 효과 넣기 | 원하는 태그에 `data-reveal` 속성 추가 (`left`, `right`, `fade`, `zoom` 가능) |
| 대표자·사업자번호 표시 | `index.html` 푸터의 주석(`<!-- -->`) 해제 후 입력 |
| 문의 폼 항목 추가 | `index.html` 폼에 `name="항목명"` 있는 input 추가 → 메일에 자동 포함 |

### 📸 사진 권장 사항
- **메인 슬라이드(hero)**: 가로 **1920px 이상** 고화질 가로 사진을 권장합니다.
  현재는 PPT에서 추출한 사진(원본 가로 약 630~1000px)을 확대해 쓰고 있어서 큰 모니터에서 다소 흐리게 보일 수 있습니다.
  공장 전경, 생산 라인, 출고 현장 사진을 고화질로 촬영해 같은 파일명으로 교체하시면 가장 좋습니다.
- 용량은 장당 500KB 이하로 압축하면 로딩이 빠릅니다. (https://squoosh.app 추천)

---

## 🌐 지원 환경
- Chrome, Edge, Safari(macOS/iOS 12+), Firefox, Samsung Internet, 네이버 웨일
- 반응형 기준: **PC 1025px 이상 / 태블릿 768~1024px / 모바일 767px 이하**
  - 태블릿부터 출고 과정, 근무 인원, 로켓그로스 등 가로 배치가 세로로 바뀝니다.
- 사용자가 OS에서 "동작 줄이기"를 켠 경우 애니메이션이 자동으로 최소화됩니다.

## 🖥️ 내 컴퓨터에서 미리보기
`index.html`을 더블클릭해도 열리지만, 지도·폰트까지 정확히 보려면 간단한 로컬 서버를 추천합니다.

```bash
python -m http.server 5500
```
→ 브라우저에서 http://localhost:5500 접속
(VS Code 사용 시 **Live Server** 확장도 편리합니다.)
