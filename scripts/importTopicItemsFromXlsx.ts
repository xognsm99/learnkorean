import fs from "fs";
import path from "path";
import process from "process";
import * as XLSX from "xlsx";
import { createClient } from "@supabase/supabase-js";

type Row = {
  no: number;
  type: string; // mcq
  level: number; // 1
  topic_slug: string;
  speaker: string;
  utterance: string;
  prompt: string;
  choice_1: string;
  choice_2: string;
  choice_3: string;
  choice_4: string;
  answer_index: number; // 1-4
  answer_text: string;
  explanation_ko: string;
  tags: string; // "move-bus,level1,place"
};

const REQUIRED_HEADERS = [
  "no",
  "type",
  "level",
  "topic_slug",
  "speaker",
  "utterance",
  "prompt",
  "choice_1",
  "choice_2",
  "choice_3",
  "choice_4",
  "answer_index",
  "answer_text",
  "explanation_ko",
  "tags",
] as const;

function die(msg: string): never {
  console.error("❌ " + msg);
  process.exit(1);
}

function toStr(v: any) {
  return (v ?? "").toString().trim();
}

function toNum(v: any) {
  const n = Number(toStr(v));
  return Number.isFinite(n) ? n : NaN;
}

function normalizeUtterance(s: string) {
  // 엑셀 셀에 실제 줄바꿈이 들어오면 \n 으로 통일
  return s.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\n/g, "\\n").trim();
}

async function main() {
  const fileArg = process.argv[2];
  const dryRun = process.argv.includes("--dry-run");

  if (!fileArg) {
    die(`사용법: npx tsx scripts/importTopicItemsFromXlsx.ts data/inbox/move.xlsx [--dry-run]`);
  }

  const xlsxPath = path.resolve(process.cwd(), fileArg);
  if (!fs.existsSync(xlsxPath)) die(`파일이 없음: ${xlsxPath}`);

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    die(`환경변수 필요: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (.env.local에 넣어)`);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  // 1) xlsx 읽기
  const wb = XLSX.readFile(xlsxPath);
  const sheetName = wb.SheetNames.includes("items") ? "items" : wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  if (!ws) die(`시트를 못 찾음`);

  const json: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });

  if (!json.length) die(`엑셀에 데이터가 없음`);

  // 2) 헤더 체크
  const headers = Object.keys(json[0] ?? {});
  for (const h of REQUIRED_HEADERS) {
    if (!headers.includes(h)) {
      die(`헤더 누락: ${h}\n현재 헤더: ${headers.join(", ")}`);
    }
  }

  // 3) row 정리 + 간단 검증
  const rows: Row[] = json.map((r) => {
    const row: Row = {
      no: toNum(r.no),
      type: toStr(r.type) || "mcq",
      level: toNum(r.level),
      topic_slug: toStr(r.topic_slug),
      speaker: toStr(r.speaker) || "-",
      utterance: normalizeUtterance(toStr(r.utterance)),
      prompt: toStr(r.prompt),
      choice_1: toStr(r.choice_1),
      choice_2: toStr(r.choice_2),
      choice_3: toStr(r.choice_3),
      choice_4: toStr(r.choice_4),
      answer_index: toNum(r.answer_index),
      answer_text: toStr(r.answer_text),
      explanation_ko: toStr(r.explanation_ko),
      tags: toStr(r.tags),
    };
    return row;
  });

  // 필수값 체크
  const bad = rows.find((r, idx) => {
    if (!Number.isFinite(r.no)) return true;
    if (!Number.isFinite(r.level)) return true;
    if (!r.topic_slug) return true;
    if (!r.prompt) return true;
    if (![1, 2, 3, 4].includes(r.answer_index)) return true;
    const choices = [r.choice_1, r.choice_2, r.choice_3, r.choice_4];
    if (choices.some((c) => !c)) return true;
    if (!choices.includes(r.answer_text)) return true;
    return false;
  });

  if (bad) {
    die(`데이터 검증 실패(빈값/정답불일치 등). 엑셀 row를 확인해줘. (예: choice 비었거나 answer_text가 보기랑 다름)`);
  }

  // 4) topics slug -> id 맵 만들기 (해당 파일에 필요한 slug만)
  const uniqueSlugs = Array.from(new Set(rows.map((r) => r.topic_slug)));

  const { data: topics, error: topicErr } = await supabase
    .from("topics")
    .select("id, slug")
    .in("slug", uniqueSlugs);

  if (topicErr) die(`topics 조회 실패: ${topicErr.message}`);

  const slugToId = new Map<string, string>();
  (topics ?? []).forEach((t: any) => slugToId.set(t.slug, t.id));

  const missing = uniqueSlugs.filter((s) => !slugToId.has(s));
  if (missing.length) {
    die(`topics에 없는 slug가 있음: ${missing.join(", ")} (topics 테이블 slug 확인 필요)`);
  }

  // 5) topic_items insert payload 만들기
  const payload = rows.map((r) => {
    const topic_id = slugToId.get(r.topic_slug)!;

    const choices = {
      speaker: r.speaker || "-",
      utterance: r.utterance || "",
      choices: [r.choice_1, r.choice_2, r.choice_3, r.choice_4],
      answer_index: r.answer_index,
      answer_text: r.answer_text,
      explanation_ko: r.explanation_ko || "",
      tags: (r.tags || "").split(",").map((x) => x.trim()).filter(Boolean),
    };

    return {
      topic_id,
      level: r.level,
      type: r.type,
      prompt: r.prompt,
      choices,
    };
  });

  console.log(`✅ 읽음: ${rows.length} rows`);
  console.log(`✅ slug: ${uniqueSlugs.join(", ")}`);
  console.log(`✅ dry-run: ${dryRun ? "YES" : "NO"}`);

  if (dryRun) {
    console.log("샘플 1개:", JSON.stringify(payload[0], null, 2));
    process.exit(0);
  }

  // 6) 대량 insert (500개씩 쪼개서 안전)
  const CHUNK = 500;
  let inserted = 0;

  for (let i = 0; i < payload.length; i += CHUNK) {
    const chunk = payload.slice(i, i + CHUNK);
    const { error } = await supabase.from("topic_items").insert(chunk);
    if (error) die(`topic_items insert 실패: ${error.message}`);
    inserted += chunk.length;
    console.log(`➡️ inserted ${inserted}/${payload.length}`);
  }

  console.log(`🎉 완료: ${inserted} rows inserted into topic_items`);
}

main().catch((e) => die(e?.message ?? String(e)));
