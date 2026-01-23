const fs = require("fs");
const path = require("path");

// Paths
const imageDir = path.join(__dirname, "../public/images_quiz/food");
const outputCsv = path.join(__dirname, "../data/seed_image_quiz_food.csv");

// Slug to Korean/English name mapping
const SLUG_TO_NAME = {
  "andong-jjimdak": { ko: "안동찜닭", en: "Andong Jjimdak" },
  "apple": { ko: "사과", en: "Apple" },
  "baechu-kimchi": { ko: "배추김치", en: "Baechu Kimchi" },
  "baguette": { ko: "바게트", en: "Baguette" },
  "banana": { ko: "바나나", en: "Banana" },
  "beondegi": { ko: "번데기", en: "Beondegi" },
  "bibimbap": { ko: "비빔밥", en: "Bibimbap" },
  "bibim-memil-guksu": { ko: "비빔메밀국수", en: "Bibim Memil Guksu" },
  "bibim-myeon": { ko: "비빔면", en: "Bibim Myeon" },
  "bindaetteok": { ko: "빈대떡", en: "Bindaetteok" },
  "bossam": { ko: "보쌈", en: "Bossam" },
  "broccoli": { ko: "브로콜리", en: "Broccoli" },
  "byeo-rice-plant": { ko: "벼", en: "Rice Plant" },
  "cake": { ko: "케이크", en: "Cake" },
  "cheese-tonkatsu": { ko: "치즈돈까스", en: "Cheese Tonkatsu" },
  "cherry-tomato": { ko: "방울토마토", en: "Cherry Tomato" },
  "chonggak-kimchi": { ko: "총각김치", en: "Chonggak Kimchi" },
  "churros": { ko: "츄러스", en: "Churros" },
  "cocktail-drink": { ko: "칵테일", en: "Cocktail" },
  "coffee-beans": { ko: "커피콩", en: "Coffee Beans" },
  "corn": { ko: "옥수수", en: "Corn" },
  "daepae-samgyeopsal": { ko: "대패삼겹살", en: "Daepae Samgyeopsal" },
  "dakgalbi": { ko: "닭갈비", en: "Dakgalbi" },
  "dakkochi": { ko: "닭꼬치", en: "Dakkochi" },
  "doenjang-jjigae": { ko: "된장찌개", en: "Doenjang Jjigae" },
  "dongdongju": { ko: "동동주", en: "Dongdongju" },
  "dotorimuk": { ko: "도토리묵", en: "Dotorimuk" },
  "dubu-tofu": { ko: "두부", en: "Tofu" },
  "dwaeji-galbi": { ko: "돼지갈비", en: "Dwaeji Galbi" },
  "dwaeji-gukbap": { ko: "돼지국밥", en: "Dwaeji Gukbap" },
  "dwaeji-kkeopdegi": { ko: "돼지껍데기", en: "Dwaeji Kkeopdegi" },
  "eel-donburi": { ko: "장어덮밥", en: "Eel Donburi" },
  "egg": { ko: "계란", en: "Egg" },
  "finger-steak": { ko: "핑거스테이크", en: "Finger Steak" },
  "french-fries": { ko: "감자튀김", en: "French Fries" },
  "fried-chicken": { ko: "치킨", en: "Fried Chicken" },
  "fried-egg": { ko: "계란후라이", en: "Fried Egg" },
  "ganjang-gejang": { ko: "간장게장", en: "Ganjang Gejang" },
  "ganjang-saeujang": { ko: "간장새우장", en: "Ganjang Saeujang" },
  "garlic": { ko: "마늘", en: "Garlic" },
  "gimbap": { ko: "김밥", en: "Gimbap" },
  "gim-bugak": { ko: "김부각", en: "Gim Bugak" },
  "gim-seaweed": { ko: "김", en: "Gim (Seaweed)" },
  "ginger": { ko: "생강", en: "Ginger" },
  "gochujang": { ko: "고추장", en: "Gochujang" },
  "gold-rich": { ko: "골드키위", en: "Gold Kiwi" },
  "gomtang": { ko: "곰탕", en: "Gomtang" },
  "gosari-bracken": { ko: "고사리", en: "Gosari (Bracken)" },
  "grapes": { ko: "포도", en: "Grapes" },
  "green-peas": { ko: "완두콩", en: "Green Peas" },
  "grilled-eel": { ko: "장어구이", en: "Grilled Eel" },
  "gulbi": { ko: "굴비", en: "Gulbi" },
  "gul-oyster": { ko: "굴", en: "Oyster" },
  "hamburger": { ko: "햄버거", en: "Hamburger" },
  "hanwoo-korean-beef": { ko: "한우", en: "Hanwoo (Korean Beef)" },
  "hobak-jeon": { ko: "호박전", en: "Hobak Jeon" },
  "hobakjuk": { ko: "호박죽", en: "Hobakjuk" },
  "hoedeopbap": { ko: "회덮밥", en: "Hoedeopbap" },
  "hongeo-samhap": { ko: "홍어삼합", en: "Hongeo Samhap" },
  "hoppang": { ko: "호빵", en: "Hoppang" },
  "hotdog": { ko: "핫도그", en: "Hotdog" },
  "ice-cream": { ko: "아이스크림", en: "Ice Cream" },
  "inari-sushi": { ko: "유부초밥", en: "Inari Sushi" },
  "injeolmi": { ko: "인절미", en: "Injeolmi" },
  "japchae": { ko: "잡채", en: "Japchae" },
  "jeonbok-abalone": { ko: "전복", en: "Abalone" },
  "jeonbokjuk": { ko: "전복죽", en: "Jeonbokjuk" },
  "jjajangmyeon": { ko: "짜장면", en: "Jjajangmyeon" },
  "jjinppang": { ko: "찐빵", en: "Jjinppang" },
  "jjukkumi": { ko: "쭈꾸미", en: "Jjukkumi" },
  "jogaetang": { ko: "조개탕", en: "Jogaetang" },
  "jokbal": { ko: "족발", en: "Jokbal" },
  "kimchi-bokkeumbap": { ko: "김치볶음밥", en: "Kimchi Fried Rice" },
  "kimchi-jeon": { ko: "김치전", en: "Kimchi Jeon" },
  "kimchi-jjim": { ko: "김치찜", en: "Kimchi Jjim" },
  "kimjang-cabbage": { ko: "김장배추", en: "Kimjang Cabbage" },
  "kiwi": { ko: "키위", en: "Kiwi" },
  "kkakdugi": { ko: "깍두기", en: "Kkakdugi" },
  "kkwabaegi": { ko: "꽈배기", en: "Kkwabaegi" },
  "kongguksu": { ko: "콩국수", en: "Kongguksu" },
  "korean-melon-chamoe": { ko: "참외", en: "Korean Melon" },
  "korean-pear-bae": { ko: "배", en: "Korean Pear" },
  "meju": { ko: "메주", en: "Meju" },
  "millefeuille-nabe": { ko: "밀푀유나베", en: "Millefeuille Nabe" },
  "mint-chocolate": { ko: "민트초코", en: "Mint Chocolate" },
  "mixed-fruit": { ko: "모듬과일", en: "Mixed Fruit" },
  "mul-kimchi": { ko: "물김치", en: "Mul Kimchi" },
  "mul-mandu": { ko: "물만두", en: "Mul Mandu" },
  "mul-naengmyeon": { ko: "물냉면", en: "Mul Naengmyeon" },
  "muneo-sukhoe": { ko: "문어숙회", en: "Muneo Sukhoe" },
  "nachos": { ko: "나초", en: "Nachos" },
  "nakji-octopus": { ko: "낙지", en: "Nakji (Octopus)" },
  "nectarine": { ko: "천도복숭아", en: "Nectarine" },
  "odeng-tang": { ko: "오뎅탕", en: "Odeng Tang" },
  "odi-mulberry": { ko: "오디", en: "Mulberry" },
  "ojingeo-squid": { ko: "오징어", en: "Squid" },
  "ojingeo-twigim": { ko: "오징어튀김", en: "Ojingeo Twigim" },
  "onion": { ko: "양파", en: "Onion" },
  "pa-kimchi": { ko: "파김치", en: "Pa Kimchi" },
  "pa-muchim": { ko: "파무침", en: "Pa Muchim" },
  "pancakes": { ko: "팬케이크", en: "Pancakes" },
  "paprika": { ko: "파프리카", en: "Paprika" },
  "peach": { ko: "복숭아", en: "Peach" },
  "peanut": { ko: "땅콩", en: "Peanut" },
  "pizza": { ko: "피자", en: "Pizza" },
  "ramyeon": { ko: "라면", en: "Ramyeon" },
  "red-chili-pepper": { ko: "홍고추", en: "Red Chili Pepper" },
  "salmon-sashimi": { ko: "연어회", en: "Salmon Sashimi" },
  "samgyeopsal": { ko: "삼겹살", en: "Samgyeopsal" },
  "samgyetang": { ko: "삼계탕", en: "Samgyetang" },
  "shrimp-tempura": { ko: "새우튀김", en: "Shrimp Tempura" },
  "soju": { ko: "소주", en: "Soju" },
  "spicy-dakbal": { ko: "닭발", en: "Spicy Dakbal" },
  "spinach": { ko: "시금치", en: "Spinach" },
  "ssal-rice": { ko: "쌀", en: "Rice" },
  "steak": { ko: "스테이크", en: "Steak" },
  "strawberry": { ko: "딸기", en: "Strawberry" },
  "takoyaki": { ko: "타코야끼", en: "Takoyaki" },
  "tonkatsu": { ko: "돈까스", en: "Tonkatsu" },
  "tornado-potato": { ko: "회오리감자", en: "Tornado Potato" },
  "tteokbokki": { ko: "떡볶이", en: "Tteokbokki" },
  "tteokgalbi": { ko: "떡갈비", en: "Tteokgalbi" },
  "tuna-sashimi": { ko: "참치회", en: "Tuna Sashimi" },
  "waffles": { ko: "와플", en: "Waffles" },
  "yukhoe": { ko: "육회", en: "Yukhoe" },
  "yukhoe-sushi": { ko: "육회초밥", en: "Yukhoe Sushi" },
};

// Shuffle array
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Read all image files
const imageFiles = fs.readdirSync(imageDir).filter((f) => f.endsWith(".jpg"));
console.log(`Found ${imageFiles.length} images`);

// Parse files and build quiz data
const allSlugs = Object.keys(SLUG_TO_NAME);
const quizRows = [];

for (const file of imageFiles) {
  const match = file.match(/^food-(.+)-\d{4}\.jpg$/);
  if (!match) {
    console.log(`Skipping unmatched file: ${file}`);
    continue;
  }

  const slug = match[1];
  const nameInfo = SLUG_TO_NAME[slug];

  if (!nameInfo) {
    console.log(`No name mapping for slug: ${slug}`);
    continue;
  }

  // Get 3 wrong answers (different slugs)
  const wrongSlugs = shuffle(allSlugs.filter((s) => s !== slug)).slice(0, 3);
  const wrongOptions = wrongSlugs.map((s) => SLUG_TO_NAME[s]);

  // Randomize answer position (1-4)
  const answerIndex = Math.floor(Math.random() * 4) + 1;

  // Build options array
  const options = [...wrongOptions];
  options.splice(answerIndex - 1, 0, nameInfo);

  // Create row
  const row = {
    category: "food",
    image_url: `/images_quiz/food/${file}`,
    question: "이 음식은 무엇인가요?",
    question_en: "What is this food?",
    option1: `${options[0].ko} (${options[0].en})`,
    option2: `${options[1].ko} (${options[1].en})`,
    option3: `${options[2].ko} (${options[2].en})`,
    option4: `${options[3].ko} (${options[3].en})`,
    answer_index: answerIndex,
    rationale: `정답은 ${nameInfo.ko} (${nameInfo.en}) 입니다.`,
    rationale_en: `The correct answer is ${nameInfo.en}.`,
    hint: "",
  };

  quizRows.push(row);
}

console.log(`Generated ${quizRows.length} quiz questions`);

// Generate CSV
const header = "category,image_url,question,question_en,option1,option2,option3,option4,answer_index,rationale,rationale_en,hint";
const csvLines = [header];

for (const row of quizRows) {
  const line = [
    row.category,
    row.image_url,
    row.question,
    row.question_en,
    row.option1,
    row.option2,
    row.option3,
    row.option4,
    row.answer_index,
    row.rationale,
    row.rationale_en,
    row.hint,
  ].join(",");
  csvLines.push(line);
}

fs.writeFileSync(outputCsv, csvLines.join("\n"), "utf-8");
console.log(`\nCSV saved to: ${outputCsv}`);
console.log("Done!");