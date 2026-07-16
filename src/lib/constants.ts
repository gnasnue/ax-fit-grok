import type {
  AiProficiency,
  AxOwner,
  AxStage,
  CompanySize,
  Industry,
  JobFunction,
  RoleLayer,
  TenureBand,
} from "@/types/diagnosis";
import type { FrictionFactorMeta } from "@/types/friction";

export const APP_NAME = "AX Fit";

export const FRICTION_FACTORS: FrictionFactorMeta[] = [
  {
    id: "F1",
    name: "평가·보상 불일치",
    shortName: "평가·보상",
    description: "AI 활용이 평가·보상 체계와 연결되지 않음",
  },
  {
    id: "F2",
    name: "중간관리자 태도·역량",
    shortName: "중간관리자",
    description: "팀장층의 독려·역량·역할 부담",
  },
  {
    id: "F3",
    name: "역할·책임 불명확",
    shortName: "역할·책임",
    description: "AX 목표·역할·책임이 레이어 간 불일치",
  },
  {
    id: "F4",
    name: "교육-업무 연결 부족",
    shortName: "교육-업무",
    description: "교육이 실제 업무 방식 변화로 이어지지 않음",
  },
  {
    id: "F5",
    name: "시간·리소스 압박",
    shortName: "시간·리소스",
    description: "실행할 시간·권한·데이터·도구 부족",
  },
];

export const ROLE_LABELS: Record<RoleLayer, string> = {
  executive: "경영진 / 임원",
  manager: "중간관리자 (팀장)",
  staff: "실무자",
};

export const JOB_FUNCTION_OPTIONS: { value: JobFunction; label: string }[] = [
  { value: "sales", label: "영업" },
  { value: "marketing", label: "마케팅" },
  { value: "ops_quality", label: "생산/품질" },
  { value: "finance", label: "재무·회계" },
  { value: "hr_admin", label: "인사·총무" },
  { value: "it_dev", label: "IT/개발" },
  { value: "cs", label: "고객지원" },
  { value: "strategy", label: "기획·전략" },
  { value: "other", label: "기타" },
];

export const TENURE_OPTIONS: { value: TenureBand; label: string }[] = [
  { value: "under_3", label: "3년 미만" },
  { value: "3_7", label: "3~7년" },
  { value: "7_15", label: "7~15년" },
  { value: "over_15", label: "15년 이상" },
];

export const AI_LEVEL_OPTIONS: { value: AiProficiency; label: string }[] = [
  { value: "rarely", label: "거의 안 씀" },
  { value: "occasional", label: "가끔 업무에 써봄" },
  { value: "frequent", label: "업무에 자주 씀" },
  { value: "leading", label: "팀에서 앞서는 편" },
];

export const INDUSTRY_OPTIONS: { value: Industry; label: string }[] = [
  { value: "manufacturing", label: "제조" },
  { value: "service", label: "서비스" },
  { value: "it_platform", label: "IT·플랫폼" },
  { value: "retail_logistics", label: "유통·물류" },
  { value: "other", label: "기타" },
];

export const SIZE_OPTIONS: { value: CompanySize; label: string }[] = [
  { value: "under_300", label: "300명 미만" },
  { value: "300_1000", label: "300~1,000명" },
  { value: "1000_2000", label: "1,000~2,000명" },
  { value: "over_2000", label: "2,000명 이상" },
];

export const AX_STAGE_OPTIONS: { value: AxStage; label: string }[] = [
  { value: "not_started", label: "아직 시작 전" },
  { value: "education_tools", label: "교육·도구 도입 중" },
  { value: "partial_apply", label: "일부 현업 적용 중" },
  { value: "enterprise_rollout", label: "전사 확산 시도 중" },
];

export const AX_OWNER_OPTIONS: { value: AxOwner; label: string }[] = [
  { value: "hr", label: "HR" },
  { value: "strategy", label: "경영기획·전략" },
  { value: "it", label: "IT" },
  { value: "tft", label: "TFT·전담조직" },
];

/** Layer weights for friction aggregation (spec §6.3) */
export const LAYER_WEIGHTS: Record<RoleLayer, number> = {
  executive: 0.75,
  manager: 1.3,
  staff: 1.2,
};

export const SCALE_MIN = 1;
export const SCALE_MAX = 5;
