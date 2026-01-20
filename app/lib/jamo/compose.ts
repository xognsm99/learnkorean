// app/lib/jamo/compose.ts
// 한글 유니코드 조합 유틸리티

import { INITIALS, MEDIALS, FINALS } from "./constants";

/** 유니코드 한글 시작점 */
const HANGUL_BASE = 0xac00;

/** 초성 개수 */
const INITIAL_COUNT = 19;

/** 중성 개수 */
const MEDIAL_COUNT = 21;

/** 종성 개수 (받침 없음 포함) */
const FINAL_COUNT = 28;

/**
 * 초성, 중성, 종성을 조합하여 한글 한 글자를 반환
 * @param initial 초성 (예: "ㄱ")
 * @param medial 중성 (예: "ㅏ")
 * @param final 종성 (예: "ㄴ") - 생략 시 받침 없음
 * @returns 조합된 한글 글자 (예: "간") 또는 null (잘못된 입력)
 */
export function composeHangul(
  initial: string,
  medial: string,
  final?: string
): string | null {
  const initialIndex = INITIALS.indexOf(initial as typeof INITIALS[number]);
  const medialIndex = MEDIALS.indexOf(medial as typeof MEDIALS[number]);
  const finalIndex = final
    ? FINALS.indexOf(final as typeof FINALS[number])
    : 0; // 받침 없음

  // 유효성 검사
  if (initialIndex === -1 || medialIndex === -1 || finalIndex === -1) {
    return null;
  }

  // 유니코드 공식: 0xAC00 + (초성인덱스 * 21 + 중성인덱스) * 28 + 종성인덱스
  const code = HANGUL_BASE + (initialIndex * MEDIAL_COUNT + medialIndex) * FINAL_COUNT + finalIndex;

  return String.fromCharCode(code);
}

/**
 * 한글 한 글자를 초성, 중성, 종성으로 분해
 * @param char 한글 한 글자
 * @returns { initial, medial, final } 또는 null (한글이 아닌 경우)
 */
export function decomposeHangul(char: string): {
  initial: string;
  medial: string;
  final: string;
} | null {
  const code = char.charCodeAt(0);

  // 한글 범위 확인 (가 ~ 힣)
  if (code < HANGUL_BASE || code > 0xd7a3) {
    return null;
  }

  const offset = code - HANGUL_BASE;
  const finalIndex = offset % FINAL_COUNT;
  const medialIndex = ((offset - finalIndex) / FINAL_COUNT) % MEDIAL_COUNT;
  const initialIndex = Math.floor(offset / (MEDIAL_COUNT * FINAL_COUNT));

  return {
    initial: INITIALS[initialIndex],
    medial: MEDIALS[medialIndex],
    final: FINALS[finalIndex],
  };
}

/**
 * 주어진 초성 인덱스가 유효한지 확인
 */
export function isValidInitial(char: string): boolean {
  return INITIALS.includes(char as typeof INITIALS[number]);
}

/**
 * 주어진 중성 인덱스가 유효한지 확인
 */
export function isValidMedial(char: string): boolean {
  return MEDIALS.includes(char as typeof MEDIALS[number]);
}

/**
 * 주어진 종성 인덱스가 유효한지 확인
 */
export function isValidFinal(char: string): boolean {
  return FINALS.includes(char as typeof FINALS[number]);
}
