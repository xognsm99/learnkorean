// node scripts/make_image_quiz_csv.js <category>
// 예) node scripts/make_image_quiz_csv.js street
//     node scripts/make_image_quiz_csv.js food

const fs = require("fs");
const path = require("path");

const category = process.argv[2];
if (!category) {
  console.error("Usage: node scripts/make_image_quiz_csv.js <category>");
  process.exit(1);
}

const IMG_DIR = path.resolve("public", "images_quiz", category);
const OUT_CSV = path.resolve("data", `seed_image_quiz_${category}.csv`);

const QUESTIONS = {
  food: ["이 음식은 무엇인가요?", "What is this food?"],
  street: ["이 간판/표지판에는 뭐라고 쓰여 있나요?", "What does this sign say?"],
  time: ["이 장소는 어디인가요?", "Where is this place?"],
  kvibe: ["이것은 무엇과 관련 있나요?", "What is this related to?"],
};

function csvEscape(s) {
  const str = String(s ?? "");
  if (/[,"\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function titleCaseFromSlug(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map(w => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

function extractSlug(filename) {
  // 기대: <category>-<slug>-####.jpg  또는 food-<slug>-####.jpg 등
  const base = filename.replace(/\.(jpg|jpeg|png|webp)$/i, "");
  const m = base.match(/^[a-z]+-(.+)-\d+$/i);
  return m ? m[1].toLowerCase() : null;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

if (!fs.existsSync(IMG_DIR)) {
  console.error("❌ Folder not found:", IMG_DIR);
  process.exit(1);
}

const files = fs
  .readdirSync(IMG_DIR)
  .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
  .sort();

const items = files
  .map(f => {
    const slug = extractSlug(f);
    if (!slug) return null;
    const labelEn = titleCaseFromSlug(slug);
    // 지금은 한글 매핑표 없으니 영어 라벨만 사용(나중에 한글 매핑 가능)
    return { file: f, slug, label: labelEn };
  })
  .filter(Boolean);

if (items.length < 4) {
  console.error("❌ Need at least 4 valid images with name like category-slug-0001.jpg");
  process.exit(1);
}

const [qKo, qEn] = QUESTIONS[category] ?? ["이것은 무엇인가요?", "What is this?"];

const header = [
  "category","image_url","question","question_en",
  "option1","option2","option3","option4",
  "answer_index","rationale","rationale_en","hint"
];

const labels = items.map(x => x.label);

const rows = items.map(it => {
  const answer = it.label;
  const wrongs = shuffle(labels.filter(x => x !== answer)).slice(0, 3);
  const opts = shuffle([answer, ...wrongs]);
  const answerIndex = opts.indexOf(answer) + 1;

  const imageUrl = `/images_quiz/${category}/${it.file}`;

  return [
    category,
    imageUrl,
    qKo,
    qEn,
    opts[0], opts[1], opts[2], opts[3],
    answerIndex,
    `정답은 ${answer} 입니다.`,
    `The correct answer is ${answer}.`,
    ""
  ];
});

let csv = header.join(",") + "\n";
csv += rows.map(r => r.map(csvEscape).join(",")).join("\n") + "\n";

fs.writeFileSync(OUT_CSV, csv, "utf8");
console.log("✅ CSV written:", OUT_CSV);
console.log("✅ rows:", rows.length);
console.log("✅ sample image_url:", rows[0][1]);
