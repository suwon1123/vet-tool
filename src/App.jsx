import { useState, useRef, useCallback } from "react";

const C = {
  bg: "#f5f6f8", white: "#ffffff", border: "#e4e7ec",
  accent: "#2563eb", accentLight: "#eff4ff",
  text: "#111827", muted: "#6b7280", sub: "#9ca3af",
  danger: "#ef4444", green: "#16a34a", warn: "#d97706",
  blue: "#2563eb", red: "#dc2626",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Noto+Sans+KR:wght@300;400;500;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bg}; color: ${C.text}; font-family: 'Noto Sans KR', sans-serif; min-height: 100vh; }
  .mono { font-family: 'Space Mono', monospace; }

  .tab-bar {
    position: fixed; bottom: 0; left: 0; right: 0;
    display: flex; background: ${C.white};
    border-top: 1px solid ${C.border}; z-index: 100;
    padding-bottom: env(safe-area-inset-bottom, 0);
    box-shadow: 0 -1px 8px rgba(0,0,0,.06);
  }
  .tab-btn {
    flex: 1; padding: 10px 4px 8px;
    display: flex; flex-direction: column; align-items: center; gap: 3px;
    background: none; border: none; cursor: pointer;
    color: ${C.sub}; font-size: 10px; font-family: 'Noto Sans KR', sans-serif; transition: color .2s;
  }
  .tab-btn.active { color: ${C.accent}; }
  .tab-btn svg { width: 22px; height: 22px; }

  .screen { min-height: 100vh; padding: 0 0 80px; max-width: 480px; margin: 0 auto; }

  .header {
    padding: 16px 20px 14px; border-bottom: 1px solid ${C.border};
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 50;
    background: ${C.white}; box-shadow: 0 1px 4px rgba(0,0,0,.04);
  }
  .header-title { font-size: 18px; font-weight: 700; color: ${C.text}; font-family: 'Space Mono', monospace; }
  .icon-btn {
    width: 34px; height: 34px; border-radius: 50%;
    background: ${C.accentLight}; border: 1.5px solid ${C.accent};
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: ${C.accent}; font-weight: 700; font-size: 15px;
    font-family: 'Space Mono', monospace; transition: all .2s;
  }
  .icon-btn:hover { background: ${C.accent}; color: #fff; }

  /* RPM */
  .tap-area {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    margin: 20px; background: ${C.white};
    border: 2px solid ${C.border}; border-radius: 24px;
    padding: 52px 20px; cursor: pointer;
    user-select: none; -webkit-tap-highlight-color: transparent;
    transition: border-color .12s, background .12s, box-shadow .12s;
    min-height: 230px; box-shadow: 0 2px 12px rgba(0,0,0,.05);
  }
  .tap-area.flash { background: ${C.accentLight}; border-color: ${C.accent}; box-shadow: 0 0 0 4px rgba(37,99,235,.1); }
  .rpm-big { font-family: 'Space Mono', monospace; font-size: 80px; font-weight: 700; color: ${C.accent}; line-height: 1; letter-spacing: -3px; transition: transform .1s; }
  .rpm-big.pulse { transform: scale(1.07); }
  .rpm-big.idle { color: #d1d5db; }
  .rpm-unit { color: ${C.muted}; font-size: 13px; margin-top: 8px; letter-spacing: 2px; font-weight: 500; }
  .tap-hint { color: ${C.sub}; font-size: 13px; margin-top: 14px; }
  .rpm-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 0 20px; }
  .stat-box { background: ${C.white}; border: 1px solid ${C.border}; border-radius: 14px; padding: 14px; box-shadow: 0 1px 4px rgba(0,0,0,.04); }
  .stat-label { color: ${C.sub}; font-size: 11px; margin-bottom: 4px; }
  .stat-val { font-family: 'Space Mono', monospace; font-size: 22px; color: ${C.text}; font-weight: 700; }
  .reset-btn {
    display: block; margin: 14px 20px; width: calc(100% - 40px);
    padding: 12px; background: ${C.white}; border: 1px solid ${C.border};
    border-radius: 12px; color: ${C.muted};
    font-family: 'Noto Sans KR', sans-serif; font-size: 14px;
    cursor: pointer; transition: all .2s; box-shadow: 0 1px 3px rgba(0,0,0,.04);
  }
  .reset-btn:hover { border-color: ${C.danger}; color: ${C.danger}; }

  /* Modal */
  .overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4); z-index: 200; display: flex; align-items: flex-end; backdrop-filter: blur(3px); }
  .modal { background: ${C.white}; border-radius: 24px 24px 0 0; border-top: 1px solid ${C.border}; padding: 20px 20px 40px; width: 100%; max-height: 88vh; overflow-y: auto; animation: slideUp .22s ease; box-shadow: 0 -4px 24px rgba(0,0,0,.1); }
  @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: none; opacity: 1; } }
  .modal-handle { width: 40px; height: 4px; background: ${C.border}; border-radius: 2px; margin: 0 auto 18px; }
  .modal-title { font-size: 16px; font-weight: 700; margin-bottom: 14px; color: ${C.text}; }
  .info-table { width: 100%; border-collapse: collapse; font-size: 13px; border-radius: 10px; overflow: hidden; border: 1px solid ${C.border}; }
  .info-table th { background: ${C.accentLight}; color: ${C.accent}; padding: 8px 12px; text-align: left; font-weight: 700; border-bottom: 1px solid ${C.border}; }
  .info-table td { padding: 9px 12px; border-bottom: 1px solid ${C.border}; vertical-align: top; line-height: 1.5; color: ${C.text}; }
  .info-table tr:last-child td { border-bottom: none; }
  .info-table tr:nth-child(even) td { background: #fafafa; }

  .section-title { font-size: 11px; font-weight: 700; letter-spacing: .8px; color: ${C.sub}; text-transform: uppercase; padding: 16px 20px 8px; }

  /* Dehydration */
  .dehyd-table { margin: 0 20px; border-radius: 14px; overflow: hidden; border: 1px solid ${C.border}; box-shadow: 0 1px 4px rgba(0,0,0,.04); }
  .dehyd-row { display: grid; grid-template-columns: 90px 1fr; border-bottom: 1px solid ${C.border}; }
  .dehyd-row:last-child { border-bottom: none; }
  .dehyd-pct { padding: 12px 8px; font-family: 'Space Mono', monospace; font-size: 12px; font-weight: 700; color: ${C.accent}; background: ${C.accentLight}; display: flex; align-items: center; justify-content: center; border-right: 1px solid ${C.border}; }
  .dehyd-sign { padding: 12px 14px; font-size: 13px; line-height: 1.6; color: ${C.text}; background: ${C.white}; }

  /* BCS */
  .seg-ctrl { display: flex; gap: 8px; padding: 0 20px 12px; }
  .seg-btn { flex: 1; padding: 8px; border-radius: 10px; border: 1px solid ${C.border}; background: ${C.white}; color: ${C.muted}; font-size: 13px; font-family: 'Noto Sans KR', sans-serif; cursor: pointer; text-align: center; transition: all .2s; }
  .seg-btn.active { background: ${C.accentLight}; border-color: ${C.accent}; color: ${C.accent}; font-weight: 700; }
  .bcs-card { margin: 0 20px 8px; border-radius: 14px; overflow: hidden; border: 1px solid ${C.border}; box-shadow: 0 1px 4px rgba(0,0,0,.04); }
  .bcs-row { display: grid; grid-template-columns: 44px 80px 1fr; border-bottom: 1px solid ${C.border}; background: ${C.white}; }
  .bcs-row:last-child { border-bottom: none; }
  .bcs-score { display: flex; align-items: center; justify-content: center; font-family: 'Space Mono', monospace; font-size: 18px; font-weight: 700; padding: 12px 4px; }
  .bcs-tag { display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; text-align: center; padding: 4px 6px; border-right: 1px solid ${C.border}; border-left: 1px solid ${C.border}; letter-spacing: .2px; line-height: 1.4; }
  .bcs-desc { padding: 10px 12px; font-size: 12px; line-height: 1.6; color: ${C.text}; }
  .thin { color: ${C.blue}; } .ideal { color: ${C.green}; } .heavy { color: ${C.warn}; } .obese { color: ${C.red}; }

  /* Calculator */
  .calc-display {
    margin: 16px 16px 0; background: ${C.text}; border-radius: 20px;
    padding: 16px 22px 18px; box-shadow: 0 4px 16px rgba(0,0,0,.13);
    min-height: 110px; display: flex; flex-direction: column; justify-content: flex-end;
  }
  .calc-expr { font-family: 'Space Mono', monospace; font-size: 14px; color: rgba(255,255,255,.4); text-align: right; min-height: 20px; margin-bottom: 4px; word-break: break-all; }
  .calc-num { font-family: 'Space Mono', monospace; font-size: 48px; font-weight: 700; color: #fff; line-height: 1; text-align: right; word-break: break-all; }
  .numpad { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; padding: 14px 16px 10px; }
  .num-btn { padding: 20px 4px; background: ${C.white}; border: 1px solid ${C.border}; border-radius: 16px; color: ${C.text}; font-family: 'Space Mono', monospace; font-size: 20px; font-weight: 700; cursor: pointer; transition: all .1s; text-align: center; box-shadow: 0 2px 6px rgba(0,0,0,.05); }
  .num-btn:active { transform: scale(.95); box-shadow: none; }
  .num-btn.op { background: ${C.accentLight}; color: ${C.accent}; border-color: #bfdbfe; font-size: 22px; }
  .num-btn.op:active { background: #dbeafe; }
  .num-btn.eq { background: ${C.accent}; color: #fff; border-color: ${C.accent}; font-size: 22px; }
  .num-btn.eq:active { background: #1d4ed8; }
  .num-btn.ac { background: #fff5f5; color: ${C.danger}; border-color: #fecaca; font-size: 15px; font-family: 'Space Mono', monospace; }
  .num-btn.del { background: #fff5f5; color: ${C.danger}; border-color: #fecaca; }
  .num-btn.zero { grid-column: span 2; }

  /* Drug table */
  .drug-group-label {
    padding: 10px 16px 6px;
    font-size: 11px; font-weight: 700; letter-spacing: .6px;
    text-transform: uppercase; color: ${C.white};
    background: #374151; margin: 0 16px;
    border-radius: 10px 10px 0 0;
  }
  .drug-table-wrap { margin: 0 16px 14px; border-radius: 0 0 12px 12px; overflow: hidden; border: 1px solid ${C.border}; border-top: none; box-shadow: 0 1px 4px rgba(0,0,0,.05); }
  .drug-table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
  .drug-table thead th { background: #f1f5f9; color: ${C.muted}; padding: 7px 10px; text-align: left; font-weight: 700; border-bottom: 1px solid ${C.border}; font-size: 10px; letter-spacing: .4px; text-transform: uppercase; }
  .drug-table tbody tr { border-bottom: 1px solid ${C.border}; background: ${C.white}; }
  .drug-table tbody tr:last-child { border-bottom: none; }
  .drug-table tbody tr:nth-child(even) { background: #fafafa; }
  .drug-table td { padding: 8px 10px; vertical-align: top; line-height: 1.5; }
  .dn { font-weight: 600; color: ${C.text}; font-size: 12px; }
  .dk { font-size: 10px; color: ${C.sub}; }
  .dd { font-family: 'Space Mono', monospace; font-size: 11px; color: ${C.accent}; font-weight: 700; }
  .ds { font-size: 11px; color: ${C.muted}; }
  .db { font-size: 11px; color: ${C.warn}; }
  .dn-wrap { display: flex; flex-direction: column; gap: 1px; }
`;

const VITALS_INFO = {
  "호흡수 (RR)": [
    { animal: "개 (Canine)", normal: "15–30 bpm" },
    { animal: "고양이 (Feline)", normal: "20–40 bpm" },
  ],
  "심박수 (HR)": [
    { animal: "대형견", normal: "60–100 bpm" },
    { animal: "중형견", normal: "80–120 bpm" },
    { animal: "소형견", normal: "90–140 bpm" },
    { animal: "고양이", normal: "140–250 bpm" },
  ],
  "체온 (BT)": [{ animal: "개·고양이", normal: "37.5–39.1°C" }],
  "혈압 (BP)": [{ animal: "개·고양이", normal: "125–145 mmHg (수축기)" }],
};

const DEHYD = [
  { pct: "<5%", signs: "감지 불가 (정상)" },
  { pct: "5–6%", signs: "점막 약간 끈적함 (tacky)" },
  { pct: "6–8%", signs: "피부 탄력 저하\n점막 건조" },
  { pct: "8–10%", signs: "안구 함몰" },
  { pct: "10–12%", signs: "피부 탄력 소실\n각막 혼탁\n저혈량증 징후" },
  { pct: ">12%", signs: "저혈량성 쇼크\n사망 위험" },
];

const BCS_DOG = [
  { score: 1, tag: "TOO\nTHIN", col: "thin", desc: "갈비뼈·요추·골반 원거리 육안 확인. 체지방 없음. 근육 소실 명확." },
  { score: 2, tag: "TOO\nTHIN", col: "thin", desc: "갈비뼈·요추·골반 쉽게 가시화. 지방 없음, 근육 최소." },
  { score: 3, tag: "TOO\nTHIN", col: "thin", desc: "갈비뼈 촉진 가능, 지방 없음. 요추 가시화. 복부 함몰." },
  { score: 4, tag: "IDEAL", col: "ideal", desc: "갈비뼈 촉진 용이, 최소한의 지방. 위에서 허리선 명확. 복부 함몰 확인." },
  { score: 5, tag: "IDEAL", col: "ideal", desc: "지방 과잉 없이 갈비뼈 촉진. 위·옆에서 허리선·복부 함몰 확인." },
  { score: 6, tag: "HEAVY", col: "heavy", desc: "약간의 지방으로 갈비뼈 촉진. 허리선 두드러지지 않음. 복부 함몰 희미." },
  { score: 7, tag: "HEAVY", col: "heavy", desc: "갈비뼈 촉진 어려움. 요추·꼬리 기부 지방. 허리선 불분명." },
  { score: 8, tag: "OBESE", col: "obese", desc: "강한 압력으로만 갈비뼈 촉진. 요추·꼬리 기부 과도한 지방. 허리선 없음." },
  { score: 9, tag: "OBESE", col: "obese", desc: "흉부·척추·꼬리 기부 대량 지방. 허리선·복부 함몰 없음. 사지 지방." },
];

const BCS_CAT = [
  { score: 1, tag: "TOO\nTHIN", col: "thin", desc: "단모 갈비뼈 육안 확인. 심한 복부 함몰. 요추·장골익 쉽게 촉진." },
  { score: 2, tag: "TOO\nTHIN", col: "thin", desc: "갈비뼈 쉽게 가시화. 요추 최소 근육. 복부 함몰 뚜렷." },
  { score: 3, tag: "TOO\nTHIN", col: "thin", desc: "갈비뼈 최소 지방으로 촉진. 요추 명확. 복부 지방 최소." },
  { score: 4, tag: "THIN", col: "thin", desc: "갈비뼈 최소 지방으로 촉진. 허리선 두드러짐. 복부 함몰 약간." },
  { score: 5, tag: "IDEAL", col: "ideal", desc: "균형 잡힘. 갈비뼈 뒤 허리선. 약간의 지방으로 갈비뼈 촉진. 복부 지방 최소." },
  { score: 6, tag: "HEAVY", col: "heavy", desc: "약간 과잉 지방. 허리선·복부 지방 두드러지지 않음. 복부 함몰 없음." },
  { score: 7, tag: "HEAVY", col: "heavy", desc: "갈비뼈 촉진 어려움. 복부 명확한 둥글림. 복부 지방 패드 중등도." },
  { score: 8, tag: "OBESE", col: "obese", desc: "갈비뼈 촉진 불가. 허리선 없음. 복부 심한 둥글림. 복부 지방 패드 두드러짐." },
  { score: 9, tag: "OBESE", col: "obese", desc: "갈비뼈 촉진 불가. 요추·안면·사지 지방. 복부 팽만." },
];

// Drug groups from the photo — 주효능 / 약물명(한글) / 역가 / 희석액 / 보관
const DRUG_GROUPS = [
  {
    group: "응급약물 — 심박수 증가",
    drugs: [
      { name: "Atropine", kr: "아트로핀", potency: "0.5 mg/ml", diluent: "—", storage: "—", note: "" },
      { name: "High Epinephrine", kr: "에피네프린", potency: "1 mg/ml", diluent: "—", storage: "—", note: "" },
    ],
  },
  {
    group: "응급약물 — 혈압 상승",
    drugs: [
      { name: "Low Epinephrine", kr: "에피네프린 (저용량)", potency: "—", diluent: "N/S 0.9ml + Epi 0.1ml", storage: "지혈제로도 사용", note: "" },
    ],
  },
  {
    group: "항생제",
    drugs: [
      { name: "AMC / Amo-cla", kr: "타라목스", potency: "100 mg/ml", diluent: "주사용수 6ml", storage: "냉장", note: "" },
      { name: "Amoxicillin", kr: "폭소린", potency: "200 mg/ml", diluent: "주사용수 5ml", storage: "냉장", note: "" },
      { name: "Amikacin", kr: "아미카신", potency: "250 mg/ml", diluent: "—", storage: "—", note: "" },
      { name: "Ampicillin/Sulbactam", kr: "유바실린/설박탐", potency: "설박탐 50 / 암피실린 100 mg/ml", diluent: "주사용수 5ml", storage: "냉장", note: "" },
      { name: "Ampicillin", kr: "펜브렉스", potency: "100 mg/ml", diluent: "주사용수 5ml", storage: "—", note: "" },
      { name: "Ampicillin", kr: "펜브록", potency: "100 mg/ml", diluent: "—", storage: "—", note: "" },
      { name: "Cefazolin", kr: "세파졸린", potency: "200 mg/ml", diluent: "주사용수 5ml", storage: "—", note: "" },
      { name: "Cefepime", kr: "맥스핌", potency: "100 mg/ml", diluent: "주사용수 5ml", storage: "냉장", note: "" },
      { name: "Cefotaxime", kr: "세포탁심", potency: "200 mg/ml", diluent: "주사용수 5ml", storage: "냉장", note: "" },
      { name: "Enrofloxacin", kr: "바이트릴", potency: "50 mg/ml", diluent: "—", storage: "—", note: "" },
      { name: "Fullgram", kr: "풀그람", potency: "150 mg/ml", diluent: "—", storage: "—", note: "" },
      { name: "Imipenem", kr: "프리페넴", potency: "100 mg/ml", diluent: "주사용수 5ml", storage: "차광, 냉장", note: "매일 제조" },
      { name: "Marbofloxacin", kr: "마보실", potency: "10 mg/ml", diluent: "동봉된 별첨용제 20ml 첨가", storage: "—", note: "" },
      { name: "Meropenem / Mepem", kr: "메로페넴", potency: "50 mg/ml", diluent: "N/S 20ml", storage: "차광, 냉장", note: "메레펨(1g) 20ml→50\n(500mg) 10ml→50\n매일 제조" },
      { name: "Metronidazole", kr: "메트리다졸", potency: "5 mg/ml", diluent: "—", storage: "—", note: "" },
      { name: "Gentamicin", kr: "겐타마이신", potency: "40 mg/ml", diluent: "—", storage: "—", note: "" },
    ],
  },
  {
    group: "위장관 보호제",
    drugs: [
      { name: "Famotidine", kr: "가스터", potency: "2 mg/ml", diluent: "—", storage: "—", note: "" },
      { name: "Omeprazole", kr: "넥시움", potency: "10 mg/ml", diluent: "주사용수 4ml", storage: "차광, 냉장", note: "" },
    ],
  },
  {
    group: "항구토제",
    drugs: [
      { name: "Maropitant / Cerenia", kr: "프리보맥스", potency: "10 mg/ml", diluent: "—", storage: "—", note: "" },
      { name: "Metoclopramide / MTC", kr: "맥큘주", potency: "5 mg/ml", diluent: "—", storage: "—", note: "CRI 제조 시 차광" },
      { name: "Ondansetrone", kr: "온단세트론", potency: "2 mg/ml", diluent: "—", storage: "—", note: "개봉 후 폐기 ×, 파라필름으로 감아두기" },
    ],
  },
  {
    group: "뇌압강하제 (이뇨제)",
    drugs: [
      { name: "Mannitol", kr: "만니톨", potency: "0.15 g/ml", diluent: "—", storage: "—", note: "" },
    ],
  },
  {
    group: "이뇨제",
    drugs: [
      { name: "Furosemide", kr: "라식스", potency: "10 mg/ml", diluent: "—", storage: "—", note: "CRI 제조 시 차광" },
    ],
  },
  {
    group: "항혈전제",
    drugs: [
      { name: "Dalteparin", kr: "프라그민", potency: "2500 IU/ml", diluent: "—", storage: "—", note: "처치 시 주사침 변경" },
    ],
  },
  {
    group: "저용량 시 소염제 / 고용량 시 면역억제제 (스테로이드)",
    drugs: [
      { name: "PDS", kr: "소론", potency: "10 mg/ml", diluent: "—", storage: "—", note: "" },
      { name: "PDS (고용량)", kr: "소론 고용량", potency: "62.5 mg/ml", diluent: "별첨용제 2ml", storage: "차광, 실온", note: "" },
    ],
  },
  {
    group: "스테로이드 (소염제)",
    drugs: [
      { name: "MPSS", kr: "메치솔/솔론", potency: "5 mg/ml", diluent: "—", storage: "—", note: "" },
      { name: "Dexamethasone", kr: "덱사메타손", potency: "5 mg/ml", diluent: "—", storage: "—", note: "" },
    ],
  },
  {
    group: "스테로이드",
    drugs: [
      { name: "Triamcinolone", kr: "트리암시놀론", potency: "2500 µg/ml", diluent: "—", storage: "—", note: "" },
    ],
  },
  {
    group: "Vit B12",
    drugs: [
      { name: "Hydroxocobalamin", kr: "하이코민", potency: "100 µg/ml", diluent: "—", storage: "—", note: "" },
    ],
  },
  {
    group: "항경련제",
    drugs: [
      { name: "Levetiracetam", kr: "에필리탐", potency: "100 mg/ml", diluent: "—", storage: "—", note: "" },
      { name: "Phenobarbital", kr: "페노바비탈", potency: "1 mg/ml", diluent: "—", storage: "—", note: "" },
      { name: "Midazolam", kr: "미다졸람", potency: "5 mg/ml", diluent: "—", storage: "—", note: "" },
      { name: "Diazepam", kr: "디아제팜", potency: "1 mg/ml", diluent: "—", storage: "—", note: "차광 보관" },
    ],
  },
  {
    group: "진통제",
    drugs: [
      { name: "Butorphanol", kr: "부토르파놀", potency: "50 mg/ml", diluent: "N/S 첨가, 술 후 진통역할", storage: "—", note: "" },
      { name: "Tramadol", kr: "트라마돌", potency: "—", diluent: "—", storage: "—", note: "" },
      { name: "Remi-fentanil", kr: "레미펜타닐", potency: "10 mg/ml", diluent: "—", storage: "—", note: "" },
      { name: "Acepromazine / ACE", kr: "세다헥트", potency: "5 mg/ml", diluent: "—", storage: "—", note: "" },
    ],
  },
  {
    group: "소염 진통제",
    drugs: [
      { name: "Meloxicam / Metacam", kr: "메타캄", potency: "100 mg/ml", diluent: "—", storage: "—", note: "치료 처방" },
    ],
  },
  {
    group: "항산화제, 진해거담제 (기침·가래 등 억제)",
    drugs: [
      { name: "N-acetylcysteine", kr: "뮤테란", potency: "10 mg/ml", diluent: "—", storage: "—", note: "강아지 구토 유발에도 사용 (고양이 ×)" },
      { name: "N-acetylcysteine", kr: "뮤테란 (고농도)", potency: "100 mg/ml", diluent: "—", storage: "—", note: "" },
    ],
  },
  {
    group: "지혈 작용",
    drugs: [
      { name: "Vit K", kr: "비타 케이", potency: "—", diluent: "—", storage: "—", note: "" },
      { name: "Tranexamic acid / TXA", kr: "트라넥삼", potency: "2 mg/ml", diluent: "—", storage: "—", note: "" },
    ],
  },
  {
    group: "항 히스타민제",
    drugs: [
      { name: "Chlorpheniramine", kr: "히스타민", potency: "—", diluent: "—", storage: "—", note: "" },
    ],
  },
];

const Icon = {
  rpm: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  hydration: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C6 10 4 14 4 17a8 8 0 0016 0c0-3-2-7-8-15z"/></svg>,
  drug: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 21V9"/></svg>,
  del: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:20,height:20}}><path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>,
};

// ── RPM ──────────────────────────────────────────────────────────────────────
function RPMScreen() {
  const [taps, setTaps] = useState([]);
  const [rpm, setRpm] = useState(null);
  const [flash, setFlash] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const timerRef = useRef(null);

  const handleTap = useCallback(() => {
    const now = Date.now();
    setTaps(prev => {
      const updated = [...prev, now].filter(t => now - t < 15000);
      if (updated.length >= 2) {
        const intervals = [];
        for (let i = 1; i < updated.length; i++) intervals.push(updated[i] - updated[i - 1]);
        const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        setRpm(Math.round(60000 / avg));
      }
      return updated;
    });
    setFlash(true); setPulse(true);
    setTimeout(() => setFlash(false), 120);
    setTimeout(() => setPulse(false), 150);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setRpm(null), 8000);
  }, []);

  const reset = () => { setTaps([]); setRpm(null); clearTimeout(timerRef.current); };
  const tapCount = taps.filter(t => Date.now() - t < 15000).length;

  return (
    <div className="screen">
      <div className="header">
        <span className="header-title">RPM</span>
        <button className="icon-btn" onClick={() => setShowInfo(true)}>i</button>
      </div>
      <div className={`tap-area${flash ? " flash" : ""}`} onClick={handleTap}>
        <div className={`rpm-big${pulse ? " pulse" : ""}${rpm === null ? " idle" : ""}`}>{rpm !== null ? rpm : "--"}</div>
        <div className="rpm-unit">BPM</div>
        <div className="tap-hint">{tapCount < 2 ? "화면을 탭하세요" : `${tapCount}번 탭됨`}</div>
      </div>
      <div className="rpm-stats">
        <div className="stat-box"><div className="stat-label">현재 측정값</div><div className="stat-val">{rpm !== null ? rpm : "--"}</div></div>
        <div className="stat-box"><div className="stat-label">탭 횟수</div><div className="stat-val">{tapCount}</div></div>
      </div>
      <button className="reset-btn" onClick={reset}>초기화</button>
      {showInfo && (
        <div className="overlay" onClick={() => setShowInfo(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-handle"/>
            <div className="modal-title">정상 참고 범위</div>
            {Object.entries(VITALS_INFO).map(([title, rows]) => (
              <div key={title} style={{marginBottom:18}}>
                <div style={{fontSize:12,fontWeight:700,color:C.accent,marginBottom:7,letterSpacing:.5,textTransform:"uppercase"}}>{title}</div>
                <table className="info-table">
                  <thead><tr><th>동물</th><th>정상 범위</th></tr></thead>
                  <tbody>{rows.map((r,i) => <tr key={i}><td>{r.animal}</td><td className="mono" style={{fontWeight:700}}>{r.normal}</td></tr>)}</tbody>
                </table>
              </div>
            ))}
            <div style={{fontSize:12,color:C.sub,marginTop:8,lineHeight:1.6}}>* White coat effect: 긴장 시 T·P·R 수치 일시적 상승 가능</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Hydration + BCS ──────────────────────────────────────────────────────────
function HydrationScreen() {
  const [tab, setTab] = useState("dehyd");
  const [bcsAnimal, setBcsAnimal] = useState("dog");
  const bcsData = bcsAnimal === "dog" ? BCS_DOG : BCS_CAT;

  return (
    <div className="screen">
      <div className="header">
        <span className="header-title" style={{fontFamily:"'Noto Sans KR',sans-serif"}}>탈수평가 & BCS</span>
      </div>
      <div style={{display:"flex",gap:8,padding:"12px 20px"}}>
        {[["dehyd","탈수 평가"],["bcs","BCS 점수"]].map(([k,l]) => (
          <button key={k} className={`seg-btn${tab===k?" active":""}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      {tab === "dehyd" && (
        <>
          <div style={{margin:"0 20px 14px",background:C.white,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px 16px",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
            <div style={{fontSize:13,lineHeight:2.1,color:C.text}}>
              <span style={{color:C.accent,fontWeight:700}}>점막색</span>: 핑크색 (정상) · 창백 · 벽돌색 · 황색 · 청색증<br/>
              <span style={{color:C.accent,fontWeight:700}}>CRT</span>: <span className="mono" style={{fontWeight:700}}>≤ 2초</span> (정상)<br/>
              <span style={{color:C.accent,fontWeight:700}}>Lab</span>: PCV · TP · BUN · USG
            </div>
          </div>
          <div className="section-title">탈수도 평가표</div>
          <div className="dehyd-table">
            {DEHYD.map((d,i) => (
              <div key={i} className="dehyd-row">
                <div className="dehyd-pct">{d.pct}</div>
                <div className="dehyd-sign" style={{whiteSpace:"pre-line"}}>{d.signs}</div>
              </div>
            ))}
          </div>
        </>
      )}
      {tab === "bcs" && (
        <>
          <div className="seg-ctrl">
            {[["dog","🐶 개"],["cat","🐱 고양이"]].map(([k,l]) => (
              <button key={k} className={`seg-btn${bcsAnimal===k?" active":""}`} onClick={() => setBcsAnimal(k)}>{l}</button>
            ))}
          </div>
          <div className="bcs-card">
            {bcsData.map((b,i) => (
              <div key={i} className="bcs-row">
                <div className={`bcs-score ${b.col}`}>{b.score}</div>
                <div className={`bcs-tag ${b.col}`} style={{whiteSpace:"pre-line"}}>{b.tag}</div>
                <div className="bcs-desc">{b.desc}</div>
              </div>
            ))}
          </div>
          <div style={{padding:"8px 20px 0",fontSize:11,color:C.sub,lineHeight:1.6}}>4–5점 (개) / 5점 (고양이) = 이상적 체형 · 출처: Nestlé Purina BCS System</div>
        </>
      )}
    </div>
  );
}

// ── Drug / Calculator ─────────────────────────────────────────────────────────
function DrugScreen() {
  const [display, setDisplay] = useState("0");
  const [expr, setExpr] = useState("");
  const [waitingOp, setWaitingOp] = useState(false);
  const [lastOp, setLastOp] = useState(null);
  const [stored, setStored] = useState(null);

  const fmt = (n) => {
    if (n === null || isNaN(n)) return "오류";
    const s = parseFloat(n.toPrecision(10)).toString();
    return s.length > 12 ? parseFloat(n.toPrecision(8)).toString() : s;
  };

  const pressNum = (n) => {
    setDisplay(prev => {
      if (waitingOp || prev === "0") { setWaitingOp(false); return n === "." ? "0." : n; }
      if (n === "." && prev.includes(".")) return prev;
      if (prev.length >= 12) return prev;
      return prev + n;
    });
  };

  const evaluate = (a, b, op) => {
    if (op === "+") return a + b;
    if (op === "−") return a - b;
    if (op === "×") return a * b;
    if (op === "÷") return b === 0 ? NaN : a / b;
    return b;
  };

  const pressOp = (op) => {
    const cur = parseFloat(display);
    if (stored !== null && !waitingOp) {
      const result = evaluate(stored, cur, lastOp);
      setDisplay(fmt(result)); setStored(result); setExpr(fmt(result) + " " + op);
    } else {
      setStored(cur); setExpr(display + " " + op);
    }
    setLastOp(op); setWaitingOp(true);
  };

  const pressEq = () => {
    if (stored === null || lastOp === null) return;
    const cur = parseFloat(display);
    const result = evaluate(stored, cur, lastOp);
    setExpr(expr + " " + display + " =");
    setDisplay(fmt(result)); setStored(null); setLastOp(null); setWaitingOp(true);
  };

  const pressAC = () => { setDisplay("0"); setExpr(""); setWaitingOp(false); setLastOp(null); setStored(null); };
  const pressDel = () => { if (waitingOp) return; setDisplay(prev => prev.length <= 1 ? "0" : prev.slice(0, -1)); };
  const pressPM = () => setDisplay(prev => { const n = parseFloat(prev); return isNaN(n) ? prev : fmt(-n); });
  const pressPct = () => setDisplay(prev => { const n = parseFloat(prev); return isNaN(n) ? prev : fmt(n / 100); });

  return (
    <div className="screen">
      <div className="header">
        <span className="header-title" style={{fontFamily:"'Noto Sans KR',sans-serif"}}>약물 용량 계산기</span>
      </div>

      <div className="calc-display">
        <div className="calc-expr">{expr || " "}</div>
        <div className="calc-num">{display}</div>
      </div>

      <div className="numpad">
        <button className="num-btn ac" onClick={pressAC}>AC</button>
        <button className="num-btn op" onClick={pressPM}>+/−</button>
        <button className="num-btn op" onClick={pressPct}>%</button>
        <button className="num-btn op" onClick={() => pressOp("÷")}>÷</button>
        <button className="num-btn" onClick={() => pressNum("7")}>7</button>
        <button className="num-btn" onClick={() => pressNum("8")}>8</button>
        <button className="num-btn" onClick={() => pressNum("9")}>9</button>
        <button className="num-btn op" onClick={() => pressOp("×")}>×</button>
        <button className="num-btn" onClick={() => pressNum("4")}>4</button>
        <button className="num-btn" onClick={() => pressNum("5")}>5</button>
        <button className="num-btn" onClick={() => pressNum("6")}>6</button>
        <button className="num-btn op" onClick={() => pressOp("−")}>−</button>
        <button className="num-btn" onClick={() => pressNum("1")}>1</button>
        <button className="num-btn" onClick={() => pressNum("2")}>2</button>
        <button className="num-btn" onClick={() => pressNum("3")}>3</button>
        <button className="num-btn op" onClick={() => pressOp("+")}>+</button>
        <button className="num-btn del" onClick={pressDel}>{Icon.del}</button>
        <button className="num-btn zero" onClick={() => pressNum("0")}>0</button>
        <button className="num-btn" onClick={() => pressNum(".")}>.</button>
        <button className="num-btn eq" onClick={pressEq}>=</button>
      </div>

      {/* Drug reference table grouped */}
      <div style={{padding:"4px 16px 6px",fontSize:11,color:C.sub,fontWeight:600,letterSpacing:.5,textTransform:"uppercase"}}>약물역가 정리표</div>
      <div style={{padding:"0 16px 4px",fontSize:10,color:"#ef4444"}}>주사용량(ml) = 몸무게(kg) × 용량 / 역가</div>

      {DRUG_GROUPS.map((g, gi) => (
        <div key={gi}>
          <div className="drug-group-label">{g.group}</div>
          <div className="drug-table-wrap">
            <table className="drug-table">
              <thead>
                <tr>
                  <th style={{width:"28%"}}>약물</th>
                  <th style={{width:"22%"}}>역가</th>
                  <th style={{width:"27%"}}>희석액</th>
                  <th>보관</th>
                </tr>
              </thead>
              <tbody>
                {g.drugs.map((d, di) => (
                  <tr key={di}>
                    <td>
                      <div className="dn-wrap">
                        <span className="dn">{d.name}</span>
                        <span className="dk">{d.kr}</span>
                        {d.note ? <span style={{fontSize:10,color:"#ef4444",marginTop:1}}>{d.note}</span> : null}
                      </div>
                    </td>
                    <td><span className="dd">{d.potency}</span></td>
                    <td><span className="ds">{d.diluent}</span></td>
                    <td><span className="db">{d.storage}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <div style={{padding:"4px 16px 12px",fontSize:10,color:C.sub,lineHeight:1.6}}>
        ⚠️ 일반적 참고치 — 실제 투약 전 임상 판단 필요
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("rpm");
  return (
    <div style={{background:C.bg, minHeight:"100vh"}}>
      <style>{css}</style>
      {tab === "rpm" && <RPMScreen />}
      {tab === "hydration" && <HydrationScreen />}
      {tab === "drug" && <DrugScreen />}
      <div className="tab-bar">
        {[
          { id: "rpm", label: "RPM", icon: Icon.rpm },
          { id: "hydration", label: "탈수 & BCS", icon: Icon.hydration },
          { id: "drug", label: "약물 계산", icon: Icon.drug },
        ].map(t => (
          <button key={t.id} className={`tab-btn${tab===t.id?" active":""}`} onClick={() => setTab(t.id)}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
