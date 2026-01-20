// app/lib/jamo/constants.ts
// 한글 자모 상수 정의

/** 초성 19자 (유니코드 순서) */
export const INITIALS = [
  "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ",
  "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"
] as const;

/** 중성 21자 (유니코드 순서) */
export const MEDIALS = [
  "ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ",
  "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ"
] as const;

/** 종성 28자 (유니코드 순서, 첫 번째는 받침 없음) */
export const FINALS = [
  "", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ",
  "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ",
  "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"
] as const;

/** 레벨3에서 사용할 대표 종성 (받침) - 쉬운 것만 */
export const COMMON_FINALS = ["ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅇ"] as const;

/** 레벨2/3에서 사용할 기본 초성 (쌍자음 제외) */
export const BASIC_INITIALS = [
  "ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"
] as const;

/** 레벨2/3에서 사용할 기본 중성 (복합 모음 제외) */
export const BASIC_MEDIALS = [
  "ㅏ", "ㅑ", "ㅓ", "ㅕ", "ㅗ", "ㅛ", "ㅜ", "ㅠ", "ㅡ", "ㅣ"
] as const;

export type Initial = typeof INITIALS[number];
export type Medial = typeof MEDIALS[number];
export type Final = typeof FINALS[number];
