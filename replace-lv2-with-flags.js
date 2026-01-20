const fs = require("fs");

const path = "app/data/emoji_vocab_300.json";
const backup = path.replace(".json", ".bak2.json");

// ISO 2-letter code -> flag emoji (regional indicators)
function flagFromCode(code) {
  const A = "A".codePointAt(0);
  const chars = code.toUpperCase().split("");
  if (chars.length !== 2) return "??";
  return String.fromCodePoint(
    0x1F1E6 + (chars[0].codePointAt(0) - A),
    0x1F1E6 + (chars[1].codePointAt(0) - A)
  );
}

const koNames = new Intl.DisplayNames(["ko"], { type: "region" });
const enNames = new Intl.DisplayNames(["en"], { type: "region" });

const CODES = [
  "KR","JP","CN","US","CA","MX","BR","AR","CL","CO","PE","VE","EC","BO","PY","UY",
  "GB","IE","FR","DE","IT","ES","PT","NL","BE","LU","CH","AT","SE","NO","DK","FI","IS",
  "PL","CZ","SK","HU","RO","BG","GR","HR","SI","RS","BA","ME","MK","AL","UA","MD","BY",
  "LT","LV","EE","RU","TR","CY","MT",
  "EG","MA","DZ","TN","LY","SD","SS","ET","ER","DJ","SO","KE","UG","TZ","RW","BI",
  "CD","CG","GA","GQ","CM","NG","GH","CI","SN","GM","GN","GW","SL","LR","TG","BJ","BF","NE",
  "ML","MR","CV","ST","AO","ZM","ZW","MW","MZ","NA","BW","ZA","LS","SZ","MG","MU","SC","KM",
  "IN","PK","BD","LK","NP","BT","MM","TH","VN","LA","KH","MY","SG","ID","PH","BN","TL",
  "AU","NZ","PG","FJ","SB","VU","WS","TO",
  "IR","IQ","IL","JO","LB","SY","SA","AE","QA","KW","BH","OM","YE",
  "AF","KZ","UZ","TM","KG","TJ","MN",
  "AZ","AM","GE",
  "CU","DO","HT","JM","TT","BS","BB","GD","LC","VC","AG","KN","BZ","GT","HN","SV","NI","CR","PA",
  "AD","MC","SM","VA",
  "TW","HK","MO"
];

const raw = fs.readFileSync(path, "utf8");
const data = JSON.parse(raw);
fs.writeFileSync(backup, raw, "utf8");

// 기존 Lv2 개수
const oldLv2 = data.filter((x) => x.level === 2).length;

// Lv2 전부 제거
const kept = data.filter((x) => x.level !== 2);

// 새 Lv2는 기존 Lv2 개수만큼 만들기 (없으면 170)
const target = oldLv2 || 170;
const takeCodes = CODES.slice(0, target);

const newLv2 = takeCodes.map((code, idx) => {
  const emoji = flagFromCode(code);
  const ko = koNames.of(code) || code;
  const en = enNames.of(code) || code;
  return {
    id: `flag_${code.toLowerCase()}_${String(idx + 1).padStart(4, "0")}`,
    emoji,
    ko,
    en,
    category: "국기",
    level: 2
  };
});

const next = [...kept, ...newLv2];

// 저장 (UTF-8)
fs.writeFileSync(path, JSON.stringify(next, null, 2), "utf8");

console.log("✅ DONE");
console.log("backup:", backup);
console.log("old Lv2:", oldLv2);
console.log("new Lv2:", newLv2.length);
console.log("total:", next.length);
