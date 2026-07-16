import type { FrictionFactorId, RoleLayer } from "@/types/diagnosis";
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

export function getActionsForFriction(
  frictionId: FrictionFactorId,
  role: RoleLayer,
): ActionItem[] {
  const t = MICRO[role][frictionId];
  return [{ id: `${role}-${frictionId}`, ...t }];
}
