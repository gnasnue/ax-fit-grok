/**
 * Shared UX copy for single-layer vs multi-layer org diagnosis.
 * Pages render these strings — do not invent divergent hardcoding.
 */

/** Role selection — always shown (before answers exist) */
export const ROLE_PAGE_NOTICES = [
  "지금은 내 역할 응답입니다. 조직 Friction Map은 수집된 레이어를 기준으로 집계됩니다.",
  "다른 역할 응답이 추가될수록 해석 정확도가 올라갑니다.",
] as const;

/** Personal result — only when org layerCount === 1 */
export const PERSONAL_SINGLE_LAYER_BADGE =
  "현재 1개 레이어 응답 기준입니다. 조직 결과 일반화 전 추가 레이어 수집을 권장합니다.";

/** Short line next to org CTA on personal result (single layer) */
export const PERSONAL_ORG_CTA_HINT =
  "조직 결과도 현재 1개 레이어 기준으로 집계됩니다.";

export const CONTINUE_ROLE_CTA = "다른 역할로 이어서 응답하기";

export const CONTINUE_ROLE_HINT =
  "경영진·팀장·실무자 응답을 모을수록 조직 맵이 정교해집니다.";

/** Demo expectation management */
export const DEMO_SAMPLE_NOTICE =
  "이 결과는 3개 레이어가 모두 채워진 샘플입니다.";

export const DEMO_QUALITY_CAVEAT =
  "직접 진단 시 수집 레이어 수에 따라 맵 정밀도와 문구 수위가 달라질 수 있습니다.";

/** Shown once on /context after leaving demo */
export const FLASH_AFTER_DEMO_EXIT =
  "데모 세션을 종료했습니다. 회사 맥락부터 직접 진단을 시작합니다.";

export const DEMO_EXIT_STORAGE_KEY = "ax-fit-flash";
