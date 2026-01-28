/**
 * Image Quiz audio_path 업데이트 스크립트
 *
 * 사용법:
 *   node scripts/update_audio_path.mjs food    # Food 카테고리만
 *   node scripts/update_audio_path.mjs street  # Street 카테고리만
 *   node scripts/update_audio_path.mjs all     # 전체
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const category = process.argv[2] || "all";

async function updateFoodAudioPath() {
  console.log("\n=== Updating FOOD audio_path ===");

  const { data: rows, error } = await supabase
    .from("image_quiz")
    .select("id, image_url, audio_path")
    .eq("category", "food")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error:", error);
    return;
  }

  let updated = 0;
  for (const row of rows) {
    // 이미지 파일명에서 숫자 추출: food-name-0045.jpg → 0045
    const match = row.image_url.match(/-(\d{4})\.jpg$/);
    if (!match) {
      console.log(`⚠️  No match: ${row.image_url}`);
      continue;
    }

    const newAudioPath = `image_quiz/food/${match[1]}.mp3`;

    if (row.audio_path === newAudioPath) continue;

    const { error: updateError } = await supabase
      .from("image_quiz")
      .update({ audio_path: newAudioPath })
      .eq("id", row.id);

    if (updateError) {
      console.error(`❌ ID ${row.id}:`, updateError);
    } else {
      console.log(`✓ ID ${row.id}: ${newAudioPath}`);
      updated++;
    }
  }

  console.log(`\nFood: ${updated}/${rows.length} updated`);
}

async function updateStreetAudioPath() {
  console.log("\n=== Updating STREET audio_path ===");

  const { data: rows, error } = await supabase
    .from("image_quiz")
    .select("id, image_url, audio_path")
    .eq("category", "street")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error:", error);
    return;
  }

  let updated = 0;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    // 순서 기반: 1번째 → 0001.mp3
    const fileNum = String(i + 1).padStart(4, "0");
    const newAudioPath = `image_quiz/street/${fileNum}.mp3`;

    if (row.audio_path === newAudioPath) continue;

    const { error: updateError } = await supabase
      .from("image_quiz")
      .update({ audio_path: newAudioPath })
      .eq("id", row.id);

    if (updateError) {
      console.error(`❌ ID ${row.id}:`, updateError);
    } else {
      console.log(`✓ ID ${row.id}: ${newAudioPath}`);
      updated++;
    }
  }

  console.log(`\nStreet: ${updated}/${rows.length} updated`);
}

async function main() {
  console.log("Image Quiz Audio Path Updater");
  console.log("Category:", category);

  if (category === "food" || category === "all") {
    await updateFoodAudioPath();
  }

  if (category === "street" || category === "all") {
    await updateStreetAudioPath();
  }

  console.log("\n✅ Done!");
}

main().catch(console.error);
