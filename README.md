# AX Fit

중견기업 HR을 위한 **AX 조직 마찰 진단** 및 업무 재설계 의사결정 지원 시스템.

## 실행

```bash
cd ax-fit
npm install
npm run dev
```

→ [http://localhost:3000](http://localhost:3000)

## 화면 흐름

1. `/` 랜딩  
2. `/context` 회사 맥락  
3. `/role` 역할 선택  
4. `/diagnose` 진단  
5. `/result/personal` 개인 결과  
6. `/result/org` 조직 결과 (Friction Map · 우선순위 · 경영진 리포트 · PDF)  
7. `/demo` 데모 결과 로드  

## 폴더 구조

```
ax-fit/
├── docs/                          # 제품 핸드오프 + 전체 스펙
├── public/fonts/                  # 커스텀 폰트 (선택)
├── src/
│   ├── app/
│   │   ├── page.tsx               # 랜딩
│   │   ├── context/page.tsx
│   │   ├── role/page.tsx
│   │   ├── diagnose/page.tsx
│   │   ├── result/personal|org/
│   │   ├── demo/page.tsx
│   │   └── api/calculate/route.ts # 규칙 엔진 API
│   ├── components/
│   │   ├── ui/                    # shadcn
│   │   ├── layout/
│   │   ├── diagnose/
│   │   ├── result/
│   │   └── report/ReportPDF.tsx
│   ├── lib/
│   │   ├── scoring/               # Friction · weights · priority
│   │   ├── templates/             # 리포트 · 액션 문장
│   │   ├── questions.ts
│   │   └── constants.ts
│   ├── stores/diagnosis.ts        # Zustand
│   ├── types/
│   └── styles/globals.css
└── supabase/                      # 스키마 (선택 연동)
```

## 스택

Next.js (App Router) · TypeScript · Tailwind · shadcn/ui · Zustand · recharts · @react-pdf/renderer · react-hook-form/zod (준비) · Supabase client (선택)

## 규칙 엔진

- 문항: `src/lib/questions.ts` (`docs/04`)
- 점수: `src/lib/scoring/*` (`docs/AX_Fit_Full_Development_Spec.md` §6)
- API: `POST /api/calculate` → 개인/조직 결과 JSON

## 스크립트

| Command | Description |
|---------|-------------|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 빌드 서빙 |
| `npm run lint` | ESLint |
