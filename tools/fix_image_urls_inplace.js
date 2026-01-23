const fs = require("fs");
const path = require("path");

// Paths
const csvPath = path.join(__dirname, "../data/seed_image_quiz_food.csv");
const imageDir = path.join(__dirname, "../public/images_quiz/food");

// Manual mapping: English option name -> actual file slug
const ENGLISH_TO_SLUG = {
  // Direct matches
  "Bibimbap": "bibimbap",
  "Jjajangmyeon": "jjajangmyeon",
  "Tteokgalbi": "tteokgalbi",
  "Gochujang": "gochujang",
  "Gimbap": "gimbap",
  "Tteokbokki": "tteokbokki",
  "Samgyeopsal": "samgyeopsal",
  "Tornado Potato": "tornado-potato",

  // Mapped differently
  "Buckwheat": "bibim-memil-guksu",
  "Chicken": "fried-chicken",
  "Fried Chicken": "fried-chicken",
  "Chinese Cabbage": "kimjang-cabbage",
  "Dakbal": "spicy-dakbal",
  "Shrimp": "shrimp-tempura",
  "Grilled Eel": "grilled-eel",
  "Hot Pot": "millefeuille-nabe",
  "Kimchi": "baechu-kimchi",
  "Mango": "banana",
  "Melon": "korean-melon-chamoe",
  "Noodles": "ramyeon",
  "Porridge": "jeonbokjuk",
  "Pretzel": "churros",
  "Pumpkin Porridge": "hobakjuk",
  "Rice": "ssal-rice",
  "Rice Cake": "injeolmi",
  "Salmon": "salmon-sashimi",
  "Seaweed": "gim-seaweed",
  "Seolleongtang": "gomtang",
  "Skate Fish": "hongeo-samhap",
  "Cake": "cake",
  "Inari Sushi": "inari-sushi",

  // Nested parentheses cases (extracted as partial)
  "Galbi (Ribs": "dwaeji-galbi",
  "Jeon (Korean Pancake": "hobak-jeon",
  "Pork Cutlet (Tonkatsu": "tonkatsu",
  "Jokbal (Pork Feet": "jokbal",
  "Beondegi (Silkworm Pupae": "beondegi",
  "해조류": "gim-seaweed", // 김(해조류) special case
};

// Read all image files
const imageFiles = fs.readdirSync(imageDir).filter((f) => f.endsWith(".jpg"));

// Build slug -> filename map
const slugToFile = {};
for (const file of imageFiles) {
  const match = file.match(/^food-(.+)-\d{4}\.jpg$/);
  if (match) {
    const slug = match[1];
    if (!slugToFile[slug]) {
      slugToFile[slug] = [];
    }
    slugToFile[slug].push(file);
  }
}

// Sort each slug's files to get the lowest number first
for (const slug in slugToFile) {
  slugToFile[slug].sort();
}

console.log("Available slugs:", Object.keys(slugToFile).length);

// Helper: extract English from option like "비빔밥 (Bibimbap)" -> "Bibimbap"
function extractEnglish(option) {
  const match = option.match(/\(([^)]+)\)/);
  return match ? match[1].trim() : null;
}

// Helper: convert English to slug (fallback)
function toSlug(english) {
  return english
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Read CSV
const csvContent = fs.readFileSync(csvPath, "utf-8");
const lines = csvContent.split("\n");
const header = lines[0];

const failures = [];
let successCount = 0;

const newLines = [header];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  // Parse CSV
  const parts = [];
  let current = "";
  let inQuotes = false;

  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
    } else if (char === "," && !inQuotes) {
      parts.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  parts.push(current);

  const answerIndex = parseInt(parts[8], 10);
  const optionIdx = 3 + answerIndex;
  const correctOption = parts[optionIdx];

  const english = extractEnglish(correctOption);
  if (!english) {
    failures.push({
      row: i + 1,
      option: correctOption,
      reason: "Could not extract English from option",
    });
    newLines.push(line);
    continue;
  }

  // Try manual mapping first, then fallback to auto slug
  let slug = ENGLISH_TO_SLUG[english];
  if (!slug) {
    slug = toSlug(english);
  }

  const matchingFiles = slugToFile[slug];

  if (!matchingFiles || matchingFiles.length === 0) {
    failures.push({
      row: i + 1,
      slug,
      english,
      option: correctOption,
      reason: `No file found for slug: ${slug}`,
    });
    newLines.push(line);
    continue;
  }

  const newFilename = matchingFiles[0];
  const newImageUrl = `/images_quiz/food/${newFilename}`;

  parts[1] = newImageUrl;
  successCount++;

  newLines.push(parts.join(","));
}

// Write back to CSV
fs.writeFileSync(csvPath, newLines.join("\n"), "utf-8");

console.log("\n=== Results ===");
console.log(`Success: ${successCount} rows updated`);
console.log(`Failures: ${failures.length} rows`);

if (failures.length > 0) {
  console.log("\n=== Failure Details ===");
  for (const f of failures) {
    console.log(`Row ${f.row}: ${f.reason}`);
    console.log(`  English: ${f.english || "N/A"}`);
    console.log(`  Option: ${f.option}`);
    if (f.slug) console.log(`  Slug tried: ${f.slug}`);
  }
}

console.log("\nDone! CSV updated in place.");