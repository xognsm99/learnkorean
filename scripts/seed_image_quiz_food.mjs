import fs from "fs";
import path from "path";

const FOOD_DIR = path.join(process.cwd(), "public", "images_quiz", "food");
const OUT_CSV = path.join(process.cwd(), "data", "seed_image_quiz_food.csv");

const category = "food";

// 파일명 토큰 -> 표시 라벨(한/영)
const LABEL_MAP = {
  "bibimbap": { ko: "비빔밥", en: "Bibimbap" },
  "kimbab": { ko: "김밥", en: "Gimbap" },
  "kimchi": { ko: "김치", en: "Kimchi" },
  "pork-belly": { ko: "삼겹살", en: "Samgyeopsal" },
  "fried-chicken": { ko: "치킨", en: "Fried Chicken" },
  "chicken": { ko: "치킨", en: "Chicken" },
  "tteokbokki": { ko: "떡볶이", en: "Tteokbokki" },
  "ramen": { ko: "라면", en: "Ramen" },
  "noodles": { ko: "국수", en: "Noodles" },
  "black-bean-noodles": { ko: "짜장면", en: "Jjajangmyeon" },
  "hotpot": { ko: "전골", en: "Hot Pot" },
  "jeon": { ko: "전", en: "Jeon (Korean Pancake)" },
  "dakbal": { ko: "닭발", en: "Dakbal" },
  "garlic-ribs": { ko: "갈비", en: "Galbi (Ribs)" },
  "grilled-eel": { ko: "장어구이", en: "Grilled Eel" },
  "rice": { ko: "밥", en: "Rice" },
  "rice-cake": { ko: "떡", en: "Rice Cake" },
  "porridge": { ko: "죽", en: "Porridge" },
  "seaweed": { ko: "김(해조류)", en: "Seaweed" },
  "kochujang": { ko: "고추장", en: "Gochujang" },
  "seolleongtang": { ko: "설렁탕", en: "Seolleongtang" },
  "silkworms": { ko: "번데기", en: "Beondegi (Silkworm Pupae)" },
  "skate": { ko: "홍어", en: "Skate Fish" },
  "buckwheat": { ko: "메밀", en: "Buckwheat" },
  "chinese-cabbage": { ko: "배추", en: "Chinese Cabbage" },
"free-shrimps": { ko: "새우", en: "Shrimp" },
"fried-tornado-potato": { ko: "회오리감자", en: "Tornado Potato" },
"korean-tteokgalbi": { ko: "떡갈비", en: "Tteokgalbi" },
"mango": { ko: "망고", en: "Mango" },
"melon": { ko: "멜론", en: "Melon" },
"pork-cutlet": { ko: "돈까스", en: "Pork Cutlet (Tonkatsu)" },
"pork-feet": { ko: "족발", en: "Jokbal (Pork Feet)" },
"pumpkin-porridge": { ko: "호박죽", en: "Pumpkin Porridge" },
"salmon": { ko: "연어", en: "Salmon" },
"the-cake": { ko: "케이크", en: "Cake" },
"tofu-sushi": { ko: "유부초밥", en: "Inari Sushi" },
"pretzel": { ko: "프레첼", en: "Pretzel" },

};

// 보기 개수(테이블이 option1~4라서 4 고정)
const OPTION_COUNT = 4;

// 안전한 CSV 이스케이프
function csvEscape(v) {
  const s = String(v ?? "");
  if (/[,"\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

// 파일명에서 토큰 뽑기: "bibimbap-1738580_1920.jpg" -> "bibimbap"
function extractToken(filename) {
  const base = filename.replace(/\.(jpg|jpeg|png|webp)$/i, "");
  // 가장 앞쪽 단어(하이픈 기준)만 쓰면 너무 짧을 때가 있어서,
  // 1) 정확 매핑키부터 먼저 찾고
  // 2) 없으면 첫 덩어리(첫 하이픈 전) 사용
  return base;
}

function findLabelFromFilename(filename) {
  const lower = filename.toLowerCase();

  // 매핑 키 중 "긴 키"부터 먼저 매칭
  const keys = Object.keys(LABEL_MAP).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    if (lower.startsWith(k + "-") || lower.startsWith(k + "_") || lower === k) {
      return { key: k, ...LABEL_MAP[k] };
    }
  }

  // fallback: 첫 토큰
  const first = lower.split(/[-_]/)[0];
  if (LABEL_MAP[first]) return { key: first, ...LABEL_MAP[first] };

  return null;
}

function pickOptions(allLabels, correctKey) {
  const pool = allLabels.filter((k) => k !== correctKey);
  // 셔플
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const distractors = pool.slice(0, OPTION_COUNT - 1);
  const opts = [correctKey, ...distractors];

  // 옵션도 셔플
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }

  const answerIndex = opts.indexOf(correctKey) + 1; // 1~4
  return { opts, answerIndex };
}

function labelText(key) {
  const l = LABEL_MAP[key];
  if (!l) return key;
  return `${l.ko} (${l.en})`;
}

// 1) 파일 목록
if (!fs.existsSync(FOOD_DIR)) {
  console.error("FOOD_DIR not found:", FOOD_DIR);
  process.exit(1);
}

const files = fs
  .readdirSync(FOOD_DIR)
  .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
  .sort((a, b) => a.localeCompare(b, "en"));

const unknown = [];
const rows = [];

const allLabelKeys = Object.keys(LABEL_MAP);

for (const f of files) {
  const label = findLabelFromFilename(f);
  if (!label) {
    unknown.push(f);
    continue;
  }

  const { opts, answerIndex } = pickOptions(allLabelKeys, label.key);

  const image_url = `/images_quiz/food/${f}`;
  const question = "이 음식은 무엇인가요?";
  const question_en = "What is this food?";

  const optionTexts = opts.map(labelText);

  const rationale = `정답은 ${label.ko} (${label.en}) 입니다.`;
  const rationale_en = `The correct answer is ${label.en}.`;

  rows.push({
    category,
    image_url,
    question,
    question_en,
    option1: optionTexts[0],
    option2: optionTexts[1],
    option3: optionTexts[2],
    option4: optionTexts[3],
    answer_index: answerIndex,
    rationale,
    rationale_en,
    hint: "", // 필요하면 나중에 채워도 됨
  });
}

// 2) CSV 출력 (Supabase import용)
fs.mkdirSync(path.dirname(OUT_CSV), { recursive: true });

const header = [
  "category",
  "image_url",
  "question",
  "question_en",
  "option1",
  "option2",
  "option3",
  "option4",
  "answer_index",
  "rationale",
  "rationale_en",
  "hint",
];

const lines = [header.join(",")];
for (const r of rows) {
  lines.push(header.map((h) => csvEscape(r[h])).join(","));
}

fs.writeFileSync(OUT_CSV, lines.join("\n"), "utf-8");

console.log("✅ CSV generated:", OUT_CSV);
console.log("✅ rows:", rows.length);

if (unknown.length) {
  console.log("\n⚠️ Unknown filenames (not mapped):");
  unknown.slice(0, 30).forEach((u) => console.log(" -", u));
  if (unknown.length > 30) console.log(` ...and ${unknown.length - 30} more`);
  console.log("\n→ LABEL_MAP에 토큰 추가하면 자동으로 포함됨.");
}
