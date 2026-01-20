// app/lib/jamo/generator.ts
// 레벨2/3 문제 및 선택지 생성 유틸리티

import { BASIC_INITIALS, BASIC_MEDIALS, COMMON_FINALS } from "./constants";
import { composeHangul } from "./compose";

/** 자모 게임 레벨 타입 */
export type JamoGameLevel = 1 | 2 | 3;

/** 레벨2/3 문제 타입 */
export interface CompositionQuizItem {
  id: string;
  level: 2 | 3;
  initial: string;      // 초성
  medial: string;       // 중성
  final?: string;       // 종성 (레벨3만)
  answer: string;       // 정답 글자
  prompt: string;       // 표시할 문제 (예: "ㄱ + ㅏ")
}

/** 선택지 포함 문제 */
export interface QuizWithChoices extends CompositionQuizItem {
  choices: string[];    // 4지선다 보기
}

/**
 * Fisher-Yates 셔플 알고리즘
 */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 배열에서 랜덤 요소 선택
 */
function randomPick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 배열에서 n개 랜덤 선택 (중복 없음)
 */
function randomPickN<T>(arr: readonly T[], n: number, exclude?: T[]): T[] {
  const filtered = exclude
    ? arr.filter(item => !exclude.includes(item))
    : [...arr];
  return shuffle([...filtered]).slice(0, n);
}

/**
 * 레벨2 문제 생성 (초성 + 중성)
 */
export function generateLevel2Quiz(): CompositionQuizItem {
  const initial = randomPick(BASIC_INITIALS);
  const medial = randomPick(BASIC_MEDIALS);
  const answer = composeHangul(initial, medial);

  if (!answer) {
    throw new Error(`Failed to compose: ${initial} + ${medial}`);
  }

  return {
    id: `lv2-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    level: 2,
    initial,
    medial,
    answer,
    prompt: `${initial} + ${medial}`,
  };
}

/**
 * 레벨3 문제 생성 (초성 + 중성 + 종성)
 */
export function generateLevel3Quiz(): CompositionQuizItem {
  const initial = randomPick(BASIC_INITIALS);
  const medial = randomPick(BASIC_MEDIALS);
  const final = randomPick(COMMON_FINALS);
  const answer = composeHangul(initial, medial, final);

  if (!answer) {
    throw new Error(`Failed to compose: ${initial} + ${medial} + ${final}`);
  }

  return {
    id: `lv3-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    level: 3,
    initial,
    medial,
    final,
    answer,
    prompt: `${initial} + ${medial} + ${final}`,
  };
}

/**
 * 레벨2 오답 생성: 중성 고정, 초성만 변경
 */
export function generateLevel2WrongAnswers(
  correctInitial: string,
  medial: string,
  count: number = 3
): string[] {
  const wrongInitials = randomPickN(BASIC_INITIALS, count, [correctInitial]);

  return wrongInitials
    .map(init => composeHangul(init, medial))
    .filter((char): char is string => char !== null);
}

/**
 * 레벨3 오답 생성: 중성+종성 고정, 초성만 변경
 */
export function generateLevel3WrongAnswers(
  correctInitial: string,
  medial: string,
  final: string,
  count: number = 3
): string[] {
  const wrongInitials = randomPickN(BASIC_INITIALS, count, [correctInitial]);

  return wrongInitials
    .map(init => composeHangul(init, medial, final))
    .filter((char): char is string => char !== null);
}

/**
 * 문제에 선택지 추가
 */
export function addChoicesToQuiz(quiz: CompositionQuizItem): QuizWithChoices {
  let wrongAnswers: string[];

  if (quiz.level === 2) {
    wrongAnswers = generateLevel2WrongAnswers(quiz.initial, quiz.medial, 3);
  } else {
    wrongAnswers = generateLevel3WrongAnswers(
      quiz.initial,
      quiz.medial,
      quiz.final!,
      3
    );
  }

  // 정답 + 오답 섞기
  const choices = shuffle([quiz.answer, ...wrongAnswers]);

  return {
    ...quiz,
    choices,
  };
}

/**
 * 레벨2 문제 세트 생성
 */
export function generateLevel2QuizSet(count: number = 10): QuizWithChoices[] {
  const quizzes: QuizWithChoices[] = [];
  const usedAnswers = new Set<string>();

  while (quizzes.length < count) {
    const quiz = generateLevel2Quiz();

    // 중복 방지
    if (!usedAnswers.has(quiz.answer)) {
      usedAnswers.add(quiz.answer);
      quizzes.push(addChoicesToQuiz(quiz));
    }
  }

  return shuffle(quizzes);
}

/**
 * 레벨3 문제 세트 생성
 */
export function generateLevel3QuizSet(count: number = 10): QuizWithChoices[] {
  const quizzes: QuizWithChoices[] = [];
  const usedAnswers = new Set<string>();

  while (quizzes.length < count) {
    const quiz = generateLevel3Quiz();

    // 중복 방지
    if (!usedAnswers.has(quiz.answer)) {
      usedAnswers.add(quiz.answer);
      quizzes.push(addChoicesToQuiz(quiz));
    }
  }

  return shuffle(quizzes);
}
