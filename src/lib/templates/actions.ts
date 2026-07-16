import type {
  FrictionFactorId,
  JobFunction,
  RoleLayer,
} from "@/types/diagnosis";
import type { ActionItem } from "@/types/report";

type ActionTemplate = Omit<ActionItem, "id">;

const EXEC_ACTIONS: Record<FrictionFactorId, ActionTemplate> = {
  F1: {
    title: "AX 기여 평가 항목 1개 승인",
    who: "경영진 + HR",
    what: "분기 평가에 AI 기여/업무 개선 항목 1개 반영 결정",
    byWhen: "30일",
    deliverable: "평가 항목 문구 + 적용 대상 팀 목록",
    metrics: {
      did: "평가 시트 반영 완료 Y/N",
      result: "파일럿 팀 적용률",
      howToTrack: "HR 액션 보드 체크 + 시트 링크",
    },
  },
  F2: {
    title: "팀장 실행 루틴 승인",
    who: "경영진",
    what: "주간 15분 AX 리뷰를 팀장 운영 커뮤니케이션에 포함",
    byWhen: "30일",
    deliverable: "경영진 메시지 1통 + 루틴 가이드",
    metrics: {
      did: "메시지 발송 Y/N",
      result: "팀장 주간 리뷰 완료율",
      howToTrack: "체크인 시트",
    },
  },
  F3: {
    title: "AX 목표 1문장 확정",
    who: "경영진",
    what: "전사 AX 목표를 측정 가능한 1문장으로 합의",
    byWhen: "14일",
    deliverable: "목표 문장 + 비목표(Non-goal) 목록",
    metrics: {
      did: "문서 승인 Y/N",
      result: "레이어별 목표 인식 펄스",
      howToTrack: "노션/위키 + 2주 후 펄스",
    },
  },
  F4: {
    title: "교육 KPI를 적용 KPI로 교체",
    who: "경영진 + HR",
    what: "이수율 대신 ‘업무 적용 건수’를 공식 지표로 채택",
    byWhen: "30일",
    deliverable: "지표 정의서 1페이지",
    metrics: {
      did: "지표 교체 공지 Y/N",
      result: "월간 적용 건수",
      howToTrack: "간단한 제출 폼",
    },
  },
  F5: {
    title: "실험 시간 슬롯 보장",
    who: "경영진",
    what: "주 2시간 AX 실험 시간을 공식 인정",
    byWhen: "14일",
    deliverable: "정책 메모 + 캘린더 가이드",
    metrics: {
      did: "정책 배포 Y/N",
      result: "슬롯 사용률",
      howToTrack: "팀 체크인",
    },
  },
};

const MICRO: Record<RoleLayer, Record<FrictionFactorId, ActionTemplate>> = {
  executive: {
    F1: EXEC_ACTIONS.F1,
    F2: EXEC_ACTIONS.F2,
    F3: EXEC_ACTIONS.F3,
    F4: EXEC_ACTIONS.F4,
    F5: EXEC_ACTIONS.F5,
  },
  manager: {
    F1: {
      title: "팀 기여 로그 시작",
      who: "본인(팀장)",
      what: "이번 주 AI로 개선한 업무 1건을 팀에 공유",
      byWhen: "이번 주",
      deliverable: "슬랙/회의 공유 1회",
      metrics: {
        did: "공유 완료 Y/N",
        result: "팀원 후속 적용 건수",
        howToTrack: "개인 체크리스트",
      },
    },
    F2: {
      title: "15분 주간 리뷰 시범",
      who: "본인(팀장)",
      what: "팀 주간 회의 마지막 15분을 AX 장벽 공유로 사용",
      byWhen: "이번 주",
      deliverable: "장벽 목록 3개",
      metrics: {
        did: "리뷰 실시 Y/N",
        result: "제거한 장벽 수",
        howToTrack: "메모",
      },
    },
    F3: {
      title: "팀 RACI 초안",
      who: "본인(팀장)",
      what: "핵심 업무 1개의 역할 표 초안 작성",
      byWhen: "2주",
      deliverable: "1페이지 RACI",
      metrics: {
        did: "초안 작성 Y/N",
        result: "팀 합의 여부",
        howToTrack: "문서 링크",
      },
    },
    F4: {
      title: "업무 1건 적용 스프린트",
      who: "본인 + 팀원 1명",
      what: "교육 내용이 아니라 실제 업무 1건에 AI 적용",
      byWhen: "2주",
      deliverable: "전/후 비교 메모",
      metrics: {
        did: "적용 완료 Y/N",
        result: "절감 시간(대략)",
        howToTrack: "간단 기록",
      },
    },
    F5: {
      title: "실험 슬롯 캘린더 블록",
      who: "본인(팀장)",
      what: "이번 주 2시간을 ‘실험’으로 캘린더 고정",
      byWhen: "이번 주",
      deliverable: "캘린더 이벤트",
      metrics: {
        did: "블록 생성 Y/N",
        result: "실제 사용 여부",
        howToTrack: "자가 체크",
      },
    },
  },
  staff: {
    F1: {
      title: "기여 사례 1줄 기록",
      who: "본인",
      what: "AI로 도움 받은 업무를 1줄로 남겨 두기",
      byWhen: "이번 주",
      deliverable: "메모 1건",
      metrics: {
        did: "기록 Y/N",
        result: "주간 기록 수",
        howToTrack: "개인 노트",
      },
    },
    F2: {
      title: "상사에게 필요한 지원 요청",
      who: "본인",
      what: "막히는 점 1가지와 필요한 지원 1가지를 상사에게 전달",
      byWhen: "이번 주",
      deliverable: "메시지/미팅 요청",
      metrics: {
        did: "요청 완료 Y/N",
        result: "응답 여부",
        howToTrack: "자가 체크",
      },
    },
    F3: {
      title: "내 역할 경계 질문 정리",
      who: "본인",
      what: "AI 관련 ‘내가 해도 되는 일 / 확인이 필요한 일’ 목록 작성",
      byWhen: "이번 주",
      deliverable: "목록 10줄",
      metrics: {
        did: "작성 Y/N",
        result: "상사 확인 여부",
        howToTrack: "노트",
      },
    },
    F4: {
      title: "반복 업무 1개에 AI 적용",
      who: "본인",
      what: "이번 주 반복 업무 1개에만 AI를 써 보기",
      byWhen: "이번 주",
      deliverable: "적용 전후 메모",
      metrics: {
        did: "적용 Y/N",
        result: "체감 시간 절감",
        howToTrack: "자가 체크",
      },
    },
    F5: {
      title: "30분 실험 약속",
      who: "본인",
      what: "캘린더에 30분 ‘실험’ 시간 확보",
      byWhen: "오늘~내일",
      deliverable: "캘린더 블록",
      metrics: {
        did: "블록 Y/N",
        result: "사용 완료 Y/N",
        howToTrack: "자가 체크",
      },
    },
  },
};

/**
 * Job-function branched micro-actions (sales / ops / hr / it / common).
 * Returns null when no job-specific override — caller falls back to role default.
 */
const JOB_ACTIONS: Partial<
  Record<
    JobFunction,
    Partial<Record<FrictionFactorId, ActionTemplate>>
  >
> = {
  sales: {
    F1: {
      title: "영업 기여 1건 기록",
      who: "본인",
      what: "이번 주 AI로 제안서·고객 메모·파이프라인 정리한 1건을 기록",
      byWhen: "이번 주",
      deliverable: "CRM/메모 1줄",
      metrics: {
        did: "기록 Y/N",
        result: "주간 기록 수",
        howToTrack: "CRM 또는 개인 노트",
      },
    },
    F4: {
      title: "고객 대응 1건 AI 초안",
      who: "본인",
      what: "반복 고객 문의·제안 초안 1건에 AI를 써 보고 수정만 본인이",
      byWhen: "이번 주",
      deliverable: "전/후 초안 비교",
      metrics: {
        did: "적용 Y/N",
        result: "작성 시간 절감 체감",
        howToTrack: "자가 체크",
      },
    },
    F2: {
      title: "팀 영업 장벽 3개 공유",
      who: "본인(팀장/동료)",
      what: "AI 적용을 막는 영업 현장 장벽 3개를 주간 회의에서 공유",
      byWhen: "이번 주",
      deliverable: "장벽 목록",
      metrics: {
        did: "공유 Y/N",
        result: "제거·완화 건수",
        howToTrack: "회의 메모",
      },
    },
  },
  ops_quality: {
    F4: {
      title: "품질/생산 기록 1건 자동화 시도",
      who: "본인",
      what: "체크리스트·이상 보고·작업 일지 중 1건에 AI/템플릿 적용",
      byWhen: "2주",
      deliverable: "적용 전후 샘플",
      metrics: {
        did: "적용 Y/N",
        result: "기록 시간 절감",
        howToTrack: "현장 노트",
      },
    },
    F5: {
      title: "현장 실험 30분 슬롯",
      who: "본인 + 조장",
      what: "교대/작업 공백 30분을 ‘기록 개선 실험’으로 합의",
      byWhen: "이번 주",
      deliverable: "실험 메모 1건",
      metrics: {
        did: "슬롯 확보 Y/N",
        result: "실험 완료 Y/N",
        howToTrack: "조 단위 체크",
      },
    },
    F3: {
      title: "현장 R&R 경계 정리",
      who: "본인",
      what: "AI/디지털 도구 관련 ‘현장 판단 가능 / 승인 필요’ 목록 작성",
      byWhen: "2주",
      deliverable: "목록 1페이지",
      metrics: {
        did: "작성 Y/N",
        result: "상사 확인",
        howToTrack: "문서",
      },
    },
  },
  hr_admin: {
    F1: {
      title: "평가 항목 초안 1줄",
      who: "본인(HR)",
      what: "AI 업무 기여를 반영할 평가 문구 초안 1개를 작성해 공유",
      byWhen: "2주",
      deliverable: "평가 문구 초안",
      metrics: {
        did: "초안 Y/N",
        result: "경영/팀장 피드백",
        howToTrack: "문서 댓글",
      },
    },
    F4: {
      title: "교육→적용 추적 1팀",
      who: "본인(HR)",
      what: "교육 이수 후 업무 적용 1건을 추적하는 간단 폼을 1팀에 시범",
      byWhen: "2주",
      deliverable: "적용 추적 폼 + 응답",
      metrics: {
        did: "폼 배포 Y/N",
        result: "적용 건수",
        howToTrack: "폼 집계",
      },
    },
    F2: {
      title: "팀장 루틴 체크리스트",
      who: "본인(HR)",
      what: "팀장 주간 15분 AX 리뷰용 체크리스트 초안 배포",
      byWhen: "2주",
      deliverable: "체크리스트 1페이지",
      metrics: {
        did: "배포 Y/N",
        result: "팀장 사용률",
        howToTrack: "2주 후 펄스",
      },
    },
  },
  it_dev: {
    F5: {
      title: "권한·데이터 병목 1건 해소",
      who: "본인(IT)",
      what: "현업 AI 실험에 막힌 권한/데이터 접근 1건을 우선 처리",
      byWhen: "이번 주",
      deliverable: "접근 오픈 또는 대안 안내",
      metrics: {
        did: "처리 Y/N",
        result: "요청 해소 시간",
        howToTrack: "티켓/슬랙",
      },
    },
    F4: {
      title: "현업용 프롬프트/템플릿 1종",
      who: "본인(IT)",
      what: "반복 업무용 프롬프트 또는 워크플로 템플릿 1종을 문서화",
      byWhen: "2주",
      deliverable: "템플릿 페이지",
      metrics: {
        did: "게시 Y/N",
        result: "현업 사용 건수",
        howToTrack: "조회/피드백",
      },
    },
    F3: {
      title: "AI 사용 가드라인 1페이지",
      who: "본인(IT) + 보안",
      what: "‘해도 되는 데이터 / 금지’를 1페이지로 정리해 공유",
      byWhen: "2주",
      deliverable: "가이드 1페이지",
      metrics: {
        did: "배포 Y/N",
        result: "문의 감소",
        howToTrack: "헬프데스크",
      },
    },
  },
  marketing: {
    F4: {
      title: "콘텐츠 초안 1건 AI 적용",
      who: "본인",
      what: "캠페인 카피·리포트 요약 중 1건에 AI 초안 후 편집",
      byWhen: "이번 주",
      deliverable: "전/후 초안",
      metrics: {
        did: "적용 Y/N",
        result: "작성 시간",
        howToTrack: "자가 체크",
      },
    },
  },
  finance: {
    F4: {
      title: "정형 리포트 1건 자동화 시도",
      who: "본인",
      what: "반복 재무 요약·체크 중 1건에 AI/템플릿 적용",
      byWhen: "2주",
      deliverable: "샘플 리포트",
      metrics: {
        did: "적용 Y/N",
        result: "절감 시간",
        howToTrack: "메모",
      },
    },
  },
  cs: {
    F4: {
      title: "고객 응대 템플릿 1건",
      who: "본인",
      what: "반복 문의 답변 초안 1종을 AI로 만들고 검수 후 사용",
      byWhen: "이번 주",
      deliverable: "템플릿 1종",
      metrics: {
        did: "작성 Y/N",
        result: "사용 횟수",
        howToTrack: "헬프데스크",
      },
    },
  },
  strategy: {
    F3: {
      title: "AX 목표 해석 1문장 공유",
      who: "본인",
      what: "전사 AX 목표를 사업부 언어 1문장으로 재해석해 공유",
      byWhen: "2주",
      deliverable: "1문장 + 비목표",
      metrics: {
        did: "공유 Y/N",
        result: "피드백 수",
        howToTrack: "문서 댓글",
      },
    },
  },
};

export function getActionsForFriction(
  frictionId: FrictionFactorId,
  role: RoleLayer,
): ActionItem[] {
  const t = MICRO[role][frictionId];
  return [{ id: `${role}-${frictionId}`, ...t }];
}

/**
 * Job-branched action for personal micro-actions.
 * Falls back to null so caller can use role default.
 */
export function getJobBranchedAction(
  frictionId: FrictionFactorId,
  role: RoleLayer,
  job: JobFunction,
): ActionItem | null {
  // Executive keeps structural actions (not job-branched)
  if (role === "executive") return null;

  const byJob = JOB_ACTIONS[job]?.[frictionId];
  if (byJob) {
    return {
      id: `${role}-${job}-${frictionId}`,
      ...byJob,
    };
  }

  // Common fallback for other jobs: slight rewording of staff/manager default
  if (job === "other" || job === "marketing" || job === "finance" || job === "cs" || job === "strategy") {
    // If no specific F match above, return null → role default
    return JOB_ACTIONS[job]?.[frictionId]
      ? {
          id: `${role}-${job}-${frictionId}`,
          ...JOB_ACTIONS[job]![frictionId]!,
        }
      : null;
  }

  return null;
}
