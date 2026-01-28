# Image Quiz 업로드 가이드

## 파일 구조

### 1. 이미지 파일
- **위치**: `public/images_quiz/{category}/`
- **형식**: `{category}-{name}-{번호}.jpg`
- **예시**:
  - `food-bibimbap-0045.jpg`
  - `street-sign-gangnam-station-0012.jpg`

### 2. 오디오 파일 (TTS)
- **위치**: Supabase Storage `audio/audio/image_quiz/{category}/`
- **형식**: `{번호}.mp3`
- **예시**: `0045.mp3`, `0012.mp3`

---

## 매핑 규칙

### Food 카테고리
이미지 파일명의 **숫자**와 오디오 파일명이 **동일**해야 함

```
food-bibimbap-0045.jpg  →  0045.mp3  (비빔밥 TTS)
food-kimchi-0078.jpg    →  0078.mp3  (김치 TTS)
```

### Street 카테고리
DB 순서대로 **순차 번호** 매핑

```
1번째 street 항목  →  0001.mp3
2번째 street 항목  →  0002.mp3
...
60번째 street 항목 →  0060.mp3
```

---

## 새 데이터 추가 방법

### Step 1: 이미지 준비
```
public/images_quiz/food/food-새음식-0150.jpg
```

### Step 2: 오디오 준비
```
Supabase Storage: audio/audio/image_quiz/food/0150.mp3
```

### Step 3: CSV 작성
```csv
category,image_url,question,question_en,option1,option2,option3,option4,answer_index,rationale,rationale_en,hint,audio_path
food,/images_quiz/food/food-새음식-0150.jpg,이 음식은 무엇인가요?,What is this food?,김치,비빔밥,새음식,떡볶이,3,정답은 새음식입니다.,The correct answer is New Food.,,image_quiz/food/0150.mp3
```

### Step 4: Supabase에 Import
1. Supabase Dashboard → Table Editor → image_quiz
2. Insert → Import from CSV

---

## 스크립트로 audio_path 자동 생성

### Food (이미지 파일명 기준)
```javascript
// 이미지 파일명에서 숫자 추출
const imageUrl = "/images_quiz/food/food-bibimbap-0045.jpg";
const match = imageUrl.match(/-(\d{4})\.jpg$/);
const audioPath = `image_quiz/food/${match[1]}.mp3`;
// 결과: "image_quiz/food/0045.mp3"
```

### Street (순서 기준)
```javascript
// DB 순서 기준 (1부터 시작)
const orderIndex = 1; // 첫 번째 항목
const audioPath = `image_quiz/street/${String(orderIndex).padStart(4, '0')}.mp3`;
// 결과: "image_quiz/street/0001.mp3"
```

---

## Supabase Storage 구조

```
audio (bucket)
└── audio
    └── image_quiz
        ├── food
        │   ├── 0001.mp3
        │   ├── 0002.mp3
        │   └── ... (이미지 번호와 동일)
        └── street
            ├── 0001.mp3
            ├── 0002.mp3
            └── ... (순서대로)
```

---

## DB 테이블 스키마 (image_quiz)

| Column | Type | Description |
|--------|------|-------------|
| id | int4 | Auto increment |
| category | text | food, street, convenience, history, kpop |
| image_url | text | `/images_quiz/{category}/{filename}.jpg` |
| question | text | 한국어 질문 |
| question_en | text | 영어 질문 |
| option1~4 | text | 4지선다 보기 |
| answer_index | int4 | 정답 위치 (1-4) |
| rationale | text | 한국어 해설 |
| rationale_en | text | 영어 해설 |
| hint | text | 힌트 (optional) |
| audio_path | text | `image_quiz/{category}/{번호}.mp3` |

---

## 주의사항

1. **이미지 번호는 4자리** (0001, 0045, 0150 등)
2. **오디오는 정답을 읽어주는 TTS** (질문이 아님)
3. **Street은 순서 기반**, Food는 **파일명 번호 기반**
4. 새 카테고리 추가 시 `app/lib/data.ts`의 `ImageQuizCategory` 타입도 업데이트
