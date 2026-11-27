/* 지구시스템과학2 Ⅱ-1 해수의 운동 — '실제 자료' 탭 (2026-11-27)
   o1 8시간 만에 하와이에 닿은 물결 — 2011 동일본 대지진 해일의 힐로 도착 시각 → 속력 → 태평양 수심
   o2 괌과 시더키, 해일이 달랐던 까닭 — 관측 해수면 − 천문조 예측 = 해일고, 기압 효과(1 hPa ≈ 1 cm)와 비교
   o3 남쪽으로 부는 바람, 차가워진 바다 — 캘리포니아 앞바다 부이의 바람과 수온(에크만 수송과 용승)
   자료: data/obs-tsunami.js, data/obs-surge.js (NOAA CO-OPS·USGS), data/obs-upwelling.js (NOAA NDBC) — 받은 날 2026-11-27
   이야기 탭 안의 '📊 실제 자료'(real-cases.js, 보스턴·펜서콜라 조석)와 겹치지 않는 자료만 쓴다. */
(function () {
"use strict";
var K = window.sthKit, LT = K.LT;
var TS = window.OBS_TSUNAMI || { h: [], quake: {}, gauge: {} };
var SG = (window.OBS_SURGE || { stations: {} }).stations;
var UP = (window.OBS_UPWELL || { rows: [] }).rows;

/* ---- 공용: 밝은 스튜디오 그래프 + 오른쪽 흰 카드 ---- */
function card(ctx, x, W, CH, title, rows, tip, good) {
  K.card(ctx, x, 8, W - x - 8, CH - 16, null);              /* 제목은 자료 종류 배지(오른쪽 위) 아래로 */
  K.t(ctx, title, x + 16, 50, { s: 12, w: "800", c: LT.mute });
  rows.forEach(function (r, i) { K.row(ctx, r[0], r[1], x + 16, W - 24, 80 + i * 27, r[2]); });
  if (tip) K.tip(ctx, tip, x + 12, CH - 56, W - x - 32, good);
}
function vline(ctx, g, x, col) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
  ctx.beginPath(); ctx.moveTo(g.X(x), g.T); ctx.lineTo(g.X(x), g.B); ctx.stroke(); ctx.restore();
}
function segs(a) { /* null 에서 끊어 그리기 */
  var out = [], cur = [];
  a.forEach(function (p) { if (p[1] == null) { if (cur.length) out.push(cur); cur = []; } else cur.push(p); });
  if (cur.length) out.push(cur); return out;
}
function src(s) { return "<small>출처: " + s + " · 받은 날 2026-11-27 · 사본은 이 저장소의 data/ 폴더.</small>"; }

/* ---- o1 계산값 ---- */
function hav(a, b, c, d) { var R = 6371, r = Math.PI / 180, x = Math.pow(Math.sin((c - a) * r / 2), 2) + Math.cos(a * r) * Math.cos(c * r) * Math.pow(Math.sin((d - b) * r / 2), 2); return 2 * R * Math.asin(Math.sqrt(x)); }
var DIST = TS.quake.lat != null ? hav(TS.quake.lat, TS.quake.lng, TS.gauge.lat, TS.gauge.lng) : 6300;
var H = TS.h, Q0 = 5 * 60 + 46.4, S0 = 12 * 60 + 30;          /* 지진 05:46:24, 자료 시작 12:30 (분) */
var BASE = (function () { var s = 0, n = 0; for (var i = 0; i < 60; i++) if (H[i] != null) { s += H[i]; n++; } return n ? s / n : 0; })();
var ARR = (function () { for (var i = 30; i < H.length; i++) if (H[i] != null && H[i] - BASE > 0.1) return i; return 77; })();
function hm(i) { var m = S0 + i, h = Math.floor(m / 60), mm = m % 60; return h + ":" + (mm < 10 ? "0" : "") + mm; }
function travel(i) { return (S0 + i - Q0) / 60; }                        /* 시간 */
var V_TRUE = DIST / travel(ARR) / 3.6, D_TRUE = V_TRUE * V_TRUE / 9.8 / 1000;   /* m/s, km */
var HMAX = Math.max.apply(null, H.filter(function (v) { return v != null; })), HMIN = Math.min.apply(null, H.filter(function (v) { return v != null; }));

/* ---- o2 계산값 ---- */
function surge(s) { var m = -9, mi = 0; s.obs.forEach(function (v, i) { var d = v - s.pred[i]; if (d > m) { m = d; mi = i; } }); return { max: m, at: mi }; }
function pmin(s) { var m = 9999; s.pres.forEach(function (v) { if (v != null && v < m) m = v; }); return m; }
var GU = SG["괌"] || { obs: [], pred: [], pres: [] }, CK = SG["시더키"] || { obs: [], pred: [], pres: [] };
var SGU = surge(GU), SCK = surge(CK);
function pEff(s) { return (s.pres[0] - pmin(s)); }                        /* hPa → 약 cm */

/* ---- o3 계산값 ---- */
function dayIdx(md) { for (var i = 0; i < UP.length; i++) if (UP[i][0] === md) return i; return -1; }
var I17 = dayIdx("06-17"), I21 = dayIdx("06-21");
var DT_TRUE = (I17 >= 0 && I21 >= 0) ? UP[I21][3] - UP[I17][3] : -1.6;

window.sthLab({
  mount: "obs", key: "obs", result: "rObs", label: "실제 자료",
  doneNote: "정리하기 탭에서, 실제 관측값이 이야기 속 생각(해일·천해파·에크만 수송)과 어디까지 맞았는지 한 문장으로 적어 보세요.",
  cases: [
  {
    id: "o1", tag: "실제 자료 · 지진 해일", title: "8시간 만에 하와이에 닿은 물결", short: "지진 해일 속력",
    kind: "obs calc", kindPos: "tr",
    who: "🌊", name: "태평양 지진 해일 경보 센터",
    say: "“2011년 3월 11일 05시 46분(세계시), 일본 동북 앞바다에서 규모 9.1 지진이 일어났습니다. 진앙에서 약 <b>" + Math.round(DIST).toLocaleString() + " km</b> 떨어진 하와이 <b>힐로 항</b>의 조위계가 <b>1분마다</b> 잰 해수면 높이입니다. 해일이 <b>언제 도착했는지</b> 읽고, 평균 속력으로 지나온 바다의 <b>평균 수심</b>을 짐작해 주세요.”",
    predict: {
      q: "지진 해일은 넓은 바다를 얼마나 빨리 건널까요?",
      options: ["㉠ 큰 배와 비슷하게, 시속 수십 km", "㉡ 제트 여객기와 비슷하게, 시속 수백 km", "㉢ 소리나 빛처럼 거의 곧바로"],
      answer: 1
    },
    task: "① 해수면이 처음으로 <b>뚜렷이 오르기 시작한 시각</b>을 슬라이더로 맞추세요(± 6분). ② 카드에 나온 평균 속력으로 <b>평균 수심</b>을 구해 맞추세요(± 0.4 km). 천해파의 속력은 v = √(gh), g = 9.8 m/s² 입니다.",
    build: function (stage, api) {
      var cv = api.canvas(290), ctx = cv.ctx, W = cv.W, a = 20, d = 3.0;
      function draw() {
        ctx.clearRect(0, 0, W, cv.H); K.studio(ctx, 0, 0, W, cv.H);
        var g = K.chart(ctx, { x: 4, y: 52, w: 676, h: cv.H - 56, pl: 52, x0: 0, x1: 180, y0: -2, y1: 1.5, xt: 6, yt: 7, light: true,
          xf: function (v) { return hm(v); }, yf: function (v) { return v.toFixed(1) + " m"; } });
        segs(H.map(function (v, i) { return [i, v]; })).forEach(function (s) { K.plot(ctx, g, s, LT.blue, { light: true, w: 2.2 }); });
        vline(ctx, g, a, LT.red);
        K.t(ctx, "내가 고른 도착 " + hm(a), Math.min(g.X(a) + 6, 560), g.T + 14, { s: 11, w: "800", c: LT.red });
        var tt = travel(a), v = DIST / tt;
        K.bigText(ctx, "도착 " + hm(a) + " · 수심 " + d.toFixed(1) + " km", 16, 38, 22, "#ffffff");
        card(ctx, 690, W, cv.H, "힐로 · 2011년 3월 11일(세계시)", [
          ["지진 발생", "05:46"], ["걸린 시간", tt.toFixed(2) + " 시간"], ["거리", Math.round(DIST).toLocaleString() + " km"],
          ["평균 속력", Math.round(v) + " km/h", LT.blue], ["", (v / 3.6).toFixed(0) + " m/s", LT.blue]
        ], "h = v² ÷ g", null);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "해일 도착 시각(세계시)", min: 0, max: 180, step: 1, value: 20, fmt: function (x) { return hm(x); }, onInput: function (x) { a = x; api.changed(); draw(); } });
      api.slider({ label: "지나온 바다의 평균 수심", min: 1, max: 8, step: 0.1, value: 3, fmt: function (x) { return x.toFixed(1) + " km"; }, onInput: function (x) { d = x; api.changed(); draw(); } });
      api.info("가로 눈금 한 칸이 30분입니다. 12시 30분부터 1시간쯤은 해수면이 거의 그대로이다가, 해일이 오면 갑자기 크게 출렁입니다. 빈 곳은 관측값이 빠진 시각입니다. "
        + src("미국 해양대기청(NOAA) 조석·해류 자료(CO-OPS), 하와이 힐로 1617760 관측소 1분 해수면(평균 해수면 기준), 2011년 3월 11일 12:30~15:30(세계시). 지진 시각·진앙은 미국 지질조사국(USGS) 지진 목록"));
      draw();
      return {
        judge: function () {
          var okA = Math.abs(a - ARR) <= 6, okD = Math.abs(d - D_TRUE) <= 0.4;
          if (okA && okD) return { ok: true, msg: "자료에서 해수면이 바탕보다 10 cm 넘게 처음 오른 때는 " + hm(ARR) + " → 걸린 시간 약 " + travel(ARR).toFixed(1) + " 시간, 평균 속력 약 " + Math.round(DIST / travel(ARR)) + " km/h(" + V_TRUE.toFixed(0) + " m/s). h = v²/g = " + V_TRUE.toFixed(0) + "² ÷ 9.8 ≈ " + D_TRUE.toFixed(1) + " km." };
          if (!okA) return { ok: false, msg: hm(a) + "는 " + (a < ARR ? "너무 이릅니다. 그때는 아직 해수면이 잔잔합니다." : "너무 늦습니다. 이미 크게 출렁이고 있어요. 출렁임이 시작되는 첫 오르막을 찾으세요.") };
          return { ok: false, msg: "도착 시각은 맞았습니다. 수심 " + d.toFixed(1) + " km는 " + (d < D_TRUE ? "얕습니다" : "깊습니다") + ". 카드의 m/s 값을 제곱해 9.8로 나누고, m를 km로 바꾸세요." };
        }
      };
    },
    hints: ["해수면이 −0.05 m 근처에서 잔잔하다가 처음으로 쑥 오르기 시작하는 곳이 도착입니다(13시 40~50분 사이를 보세요).", "예: 200 m/s 라면 h = 200 × 200 ÷ 9.8 ≈ 4,080 m ≈ 4.1 km. 단위를 m에서 km로 바꾸는 것을 잊지 마세요."],
    solution: "도착 <b>" + hm(ARR) + "</b>(세계시), 평균 속력 약 <b>" + Math.round(DIST / travel(ARR)) + " km/h</b>, 평균 수심 약 <b>" + D_TRUE.toFixed(1) + " km</b>.",
    why: "지진 해일은 파장이 수백 km나 되어, 깊이가 4~5 km인 대양에서도 <b>수심이 파장보다 훨씬 얕은 천해파</b>로 움직입니다. 그래서 속력이 수심만으로 정해지고(v = √(gh)), 깊은 바다일수록 빠릅니다. 이 자료에서 얻은 약 " + D_TRUE.toFixed(1) + " km는 해일이 지나온 북서태평양 바닥의 평균 깊이를 꽤 잘 맞힙니다.<br>"
      + "힐로 항에서는 도착 뒤 해수면이 몇십 분 간격으로 최고 " + HMAX.toFixed(1) + " m, 최저 −" + Math.abs(HMIN).toFixed(1) + " m까지 오르내렸습니다(가장 큰 물결은 첫 물결보다 뒤에 왔습니다). 실제 해일은 섬과 해저 산맥을 돌아가고 바닷가 가까이서 느려지므로, 이렇게 구한 수심은 지나온 길 전체의 '평균'으로만 보아야 합니다."
  },
  {
    id: "o2", tag: "실제 자료 · 폭풍 해일", title: "괌과 시더키, 해일이 달랐던 까닭", short: "폭풍 해일",
    kind: "obs calc", kindPos: "tr",
    who: "🌀", name: "해양 재난 연구소",
    say: "“2023년 5월 태풍 <b>마와르</b>가 태평양의 <b>괌</b> 바로 곁을, 8월 허리케인 <b>이달리아</b>가 미국 플로리다의 <b>시더키</b> 북쪽을 지나갔습니다. 파란 선은 실제 해수면, 점선은 달과 태양만으로 계산한 <b>천문조 예측값</b>입니다. 둘의 차이(관측 − 예측)가 <b>해일고</b>예요. 기압이 낮아진 것만으로 이 해일을 설명할 수 있을까요?”",
    predict: {
      q: "폭풍 해일은 주로 무엇 때문에 생길까요?",
      options: ["㉠ 기압이 낮아져 해수면이 빨려 올라가는 효과만으로", "㉡ 낮은 기압의 효과에, 강한 바람이 바닷물을 해안으로 밀어붙이는 효과가 더해져서", "㉢ 태풍이 오면 달의 인력이 세져서"],
      answer: 1
    },
    task: "관측소를 바꿔 가며 <b>시각</b> 슬라이더로 해일고와 기압을 읽으세요. 그다음 ① <b>시더키의 가장 큰 해일고</b>를 맞추고(± 0.1 m) ② 기압 효과(기압이 1 hPa 낮아지면 해수면 약 1 cm 상승)로 설명되지 않는 <b>바람 효과가 더 컸던 곳</b>을 고르세요.",
    build: function (stage, api) {
      var cv = api.canvas(300), ctx = cv.ctx, W = cv.W, stn = "괌", t = 12, s = 1.0, pick = "";
      function draw() {
        var S = stn === "괌" ? GU : CK, n = S.obs.length;
        ctx.clearRect(0, 0, W, cv.H); K.studio(ctx, 0, 0, W, cv.H);
        var lo = stn === "괌" ? -0.6 : -1, hi = stn === "괌" ? 1 : 3;
        var g = K.chart(ctx, { x: 4, y: 52, w: 676, h: cv.H - 56, pl: 52, x0: 0, x1: n, y0: lo, y1: hi, xt: 6, yt: 4, light: true,
          xf: function (v) { var D = new Date(Date.UTC(+S.start.slice(0, 4), +S.start.slice(5, 7) - 1, +S.start.slice(8, 10)) + Math.round(v) * 3600e3); return (D.getUTCMonth() + 1) + "/" + D.getUTCDate() + " " + D.getUTCHours() + "시"; },
          yf: function (v) { return v.toFixed(1) + " m"; } });
        K.plot(ctx, g, S.pred.map(function (y, i) { return [i, y]; }), LT.mute, { light: true, w: 2, dash: [6, 5], glow: false });
        K.plot(ctx, g, S.obs.map(function (y, i) { return [i, y]; }), LT.blue, { light: true, w: 2.6 });
        vline(ctx, g, t, LT.red);
        var o = S.obs[t], p = S.pred[t], pr = S.pres[t];
        ctx.fillStyle = "#fff"; ctx.strokeStyle = LT.red; ctx.lineWidth = 2.5;
        [o, p].forEach(function (y) { ctx.beginPath(); ctx.arc(g.X(t), g.Y(y), 4.5, 0, 6.2832); ctx.fill(); ctx.stroke(); });
        K.t(ctx, "── 관측   - - 천문조 예측", g.R - 4, g.T + 14, { s: 11, w: "800", a: "right", c: LT.mute });
        K.bigText(ctx, stn + " · 해일고 " + (o - p).toFixed(2) + " m", 16, 38, 22, "#ffffff");
        card(ctx, 690, W, cv.H, (S.storm || stn) + " · 세계시", [
          ["관측 해수면", o.toFixed(2) + " m", LT.blue], ["천문조 예측", p.toFixed(2) + " m", LT.mute], ["해일고", (o - p).toFixed(2) + " m", LT.red],
          ["기압", pr == null ? "–" : pr.toFixed(1) + " hPa"], ["폭풍 전 기압", S.pres[0].toFixed(1) + " hPa", LT.mute],
          ["내 답(시더키)", s.toFixed(2) + " m", LT.blue]
        ], pick ? "바람 효과가 큰 곳: " + pick : "관측소를 바꿔 보세요", null);
      }
      cv.canvas._redraw = draw;
      api.seg({ label: "관측소", value: "괌", options: [{ v: "괌", t: "괌 (태평양)" }, { v: "시더키", t: "시더키 (멕시코만)" }], onPick: function (x) { stn = x; draw(); } });
      api.slider({ label: "시각(관측 시작부터)", min: 0, max: 71, step: 1, value: 12, fmt: function (x) { return x + " 시간째"; }, onInput: function (x) { t = x; draw(); } });
      api.slider({ label: "① 시더키의 가장 큰 해일고", min: 0, max: 3.5, step: 0.05, value: 1, fmt: function (x) { return x.toFixed(2) + " m"; }, onInput: function (x) { s = x; api.changed(); draw(); } });
      api.seg({ label: "② 기압만으로 설명되지 않는 바람 효과가 더 컸던 곳", value: "", options: [{ v: "괌", t: "괌" }, { v: "시더키", t: "시더키" }, { v: "같다", t: "비슷하다" }], onPick: function (x) { pick = x; api.changed(); draw(); } });
      api.info("기압 효과는 ‘폭풍 전 기압 − 가장 낮은 기압’(hPa)만큼 cm 단위로 해수면이 오른다고 어림합니다. "
        + src("미국 해양대기청(NOAA) 조석·해류 자료(CO-OPS), 괌 Apra Harbor 1630000(2023년 5월 23~25일)·시더키 8727520(2023년 8월 29~31일)의 매시 관측 해수면·천문조 예측값·기압, 세계시, 평균 해수면 기준"));
      draw();
      return {
        judge: function () {
          var okS = Math.abs(s - SCK.max) <= 0.1 + 1e-9, okP = pick === "시더키";
          var txt = "괌: 해일고 " + SGU.max.toFixed(2) + " m, 기압 효과 약 " + pEff(GU).toFixed(0) + " cm. 시더키: 해일고 " + SCK.max.toFixed(2) + " m, 기압 효과 약 " + pEff(CK).toFixed(0) + " cm.";
          if (okS && okP) return { ok: true, msg: txt + " 시더키는 해일의 대부분이 바람이 밀어 올린 물입니다." };
          if (!okS) return { ok: false, msg: "시더키 해일고 " + s.toFixed(2) + " m는 " + (s < SCK.max ? "작습니다" : "큽니다") + ". 시더키로 바꾸고, 파란 선과 점선이 가장 많이 벌어진 시각을 찾아 카드의 ‘해일고’를 읽으세요." };
          return { ok: false, msg: "해일고는 맞았습니다. 이제 두 곳에서 ‘해일고’와 ‘기압 효과(폭풍 전 기압 − 최저 기압, cm)’를 견주어 보세요. 차이가 훨씬 큰 곳은 어디인가요?" };
        }
      };
    },
    hints: ["시더키는 8월 30일 낮(관측 30~40시간째)을 보세요.", "괌은 해일고가 기압 효과와 엇비슷하고, 시더키는 해일고가 기압 효과의 10배가 넘습니다."],
    solution: "시더키 최대 해일고 약 <b>" + SCK.max.toFixed(2) + " m</b>, 바람 효과가 더 컸던 곳은 <b>시더키</b>.",
    why: "폭풍 해일은 두 가지가 겹쳐 생깁니다. ① 태풍 중심의 <b>낮은 기압</b>이 해수면을 빨아올리는 효과(1 hPa에 약 1 cm)와 ② <b>강한 바람</b>이 바닷물을 해안 쪽으로 밀어붙여 쌓는 효과입니다. 괌은 섬 바로 앞이 깊은 바다라 바람에 밀린 물이 쌓일 곳이 적어, 해일고 " + SGU.max.toFixed(2) + " m가 기압 효과 약 " + pEff(GU).toFixed(0) + " cm와 엇비슷했습니다. 시더키 앞바다는 얕고 넓은 대륙붕이어서 바다 쪽에서 불어 드는 바람이 물을 해안에 쌓아, 기압 효과는 " + pEff(CK).toFixed(0) + " cm뿐인데 해일고가 " + SCK.max.toFixed(2) + " m나 되었습니다.<br>"
      + "해일이 <b>만조와 겹치면</b> 실제 해수면은 해일고보다 더 높아집니다. 그래서 우리나라도 서·남해안처럼 바다가 얕고 만이 많은 곳에서, 태풍이 사리 만조 무렵에 올 때 해일 피해가 커집니다."
  },
  {
    id: "o3", tag: "실제 자료 · 에크만 수송과 용승", title: "남쪽으로 부는 바람, 차가워진 바다", short: "연안 용승",
    kind: "obs", kindPos: "tr",
    who: "🐟", name: "몬터레이만 수산 연구소",
    say: "“미국 캘리포니아 몬터레이만 앞바다 부이가 잰 2023년 6월 1일 ~ 7월 10일의 하루 평균 자료입니다. 막대는 해안선을 따라 <b>남쪽으로 부는 바람</b>의 세기, 선은 <b>표층 수온</b>이에요. 6월 중순 며칠 동안 바람이 잦아들었다가, <b>6월 18~21일</b>에 남쪽으로 강한 바람이 불었습니다. 그때 바다는 어떻게 되었을까요?”",
    predict: {
      q: "북반구 대륙의 서쪽 해안에서 해안선을 따라 남쪽으로(적도 쪽으로) 바람이 며칠 강하게 불면 연안의 표층 수온은?",
      options: ["㉠ 바람이 남쪽의 따뜻한 물을 끌고 와 올라간다", "㉡ 표층의 물이 먼바다로 밀려나고 아래의 찬물이 올라와 내려간다", "㉢ 바람은 수온과 관계가 없다"],
      answer: 1
    },
    task: "① 표층 바닷물 전체가 움직이는 방향(<b>에크만 수송</b>)을 고르고 ② 날짜 슬라이더로 읽어 <b>6월 17일 → 21일의 수온 변화</b>를 맞추세요(± 0.2 ℃, 내려가면 −).",
    build: function (stage, api) {
      var cv = api.canvas(300), ctx = cv.ctx, W = cv.W, k = 16, dir = "", dt = 0;
      function draw() {
        ctx.clearRect(0, 0, W, cv.H); K.studio(ctx, 0, 0, W, cv.H);
        var n = UP.length;
        var g = K.chart(ctx, { x: 4, y: 52, w: 676, h: cv.H - 56, pl: 52, pr: 50, x0: -0.5, x1: n - 0.5, y0: 11, y1: 17, xt: 4, yt: 6, light: true,
          xf: function (v) { var i = Math.round(v); return UP[i] ? (+UP[i][0].slice(0, 2)) + "/" + (+UP[i][0].slice(3)) : ""; }, yf: function (v) { return v.toFixed(0) + " ℃"; } });
        /* 오른쪽 축: 바람 −6 ~ 12 m/s (수온 축 11~17 에 맞춤) */
        function WY(w) { return g.B - (w + 6) / 18 * (g.B - g.T); }
        for (var w = -5; w <= 10; w += 5) K.t(ctx, w + " m/s", g.R + 4, WY(w) + 4, { s: 10, w: "700", c: LT.orange });
        ctx.save(); ctx.strokeStyle = "rgba(232,89,12,.45)"; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(g.L, WY(0)); ctx.lineTo(g.R, WY(0)); ctx.stroke(); ctx.restore();
        var bw = (g.R - g.L) / n * 0.62;
        UP.forEach(function (r, i) {
          var x = g.X(i), y0 = WY(0), y1 = WY(r[1]);
          ctx.fillStyle = r[1] >= 0 ? "rgba(232,89,12,.55)" : "rgba(92,112,134,.35)";
          ctx.fillRect(x - bw / 2, Math.min(y0, y1), bw, Math.abs(y1 - y0));
        });
        K.plot(ctx, g, UP.map(function (r, i) { return [i, r[3]]; }), LT.blue, { light: true, w: 2.8, dots: 2.5 });
        vline(ctx, g, k, LT.red);
        K.t(ctx, "막대: 남쪽으로 부는 바람(오른쪽 축)  선: 표층 수온", g.L + 6, g.T + 14, { s: 11, w: "800", c: LT.mute });
        var r = UP[k];
        K.bigText(ctx, (+r[0].slice(0, 2)) + "월 " + (+r[0].slice(3)) + "일 · 수온 " + r[3].toFixed(2) + " ℃", 16, 38, 22, "#ffffff");
        card(ctx, 690, W, cv.H, "46042 부이 · 2023년", [
          ["날짜", (+r[0].slice(0, 2)) + "월 " + (+r[0].slice(3)) + "일"], ["남쪽으로 부는 바람", r[1].toFixed(1) + " m/s", LT.orange],
          ["표층 수온", r[3].toFixed(2) + " ℃", LT.blue], ["내 답: 수온 변화", (dt > 0 ? "+" : "") + dt.toFixed(2) + " ℃", LT.blue],
          ["수송 방향", dir || "–", LT.blue]
        ], "17일과 21일을 읽어 빼세요", null);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "날짜", min: 0, max: UP.length - 1, step: 1, value: 16, fmt: function (x) { var r = UP[x]; return r ? (+r[0].slice(0, 2)) + "월 " + (+r[0].slice(3)) + "일" : ""; }, onInput: function (x) { k = x; draw(); } });
      api.seg({ label: "① 에크만 수송 방향", value: "", options: [{ v: "남쪽(바람과 같은 쪽)", t: "바람과 같은 남쪽" }, { v: "서쪽(먼바다)", t: "바람의 오른쪽 = 먼바다" }, { v: "동쪽(해안)", t: "바람의 왼쪽 = 해안" }], onPick: function (x) { dir = x; api.changed(); draw(); } });
      api.slider({ label: "② 6월 17일 → 21일 수온 변화", min: -3, max: 3, step: 0.05, value: 0, fmt: function (x) { return (x > 0 ? "+" : "") + x.toFixed(2) + " ℃"; }, onInput: function (x) { dt = x; api.changed(); draw(); } });
      api.info("이곳의 해안선은 북북서에서 남남동으로 뻗어 있어, 남쪽으로 부는 바람이 곧 해안선을 따라 부는 바람입니다. 부이는 해안에서 수십 km 떨어진 바다에 떠 있습니다. "
        + src("미국 해양대기청(NOAA) 국립자료부이센터(NDBC) 46042 부이(몬터레이만 앞바다) 10분 간격 풍향·풍속·표층 수온을 하루(세계시) 평균, 2023년 6월 1일~7월 10일"));
      draw();
      return {
        judge: function () {
          var okD = dir === "서쪽(먼바다)", okT = Math.abs(dt - DT_TRUE) <= 0.2 + 1e-9;
          if (okD && okT) return { ok: true, msg: "17일 " + UP[I17][3].toFixed(2) + " ℃ → 21일 " + UP[I21][3].toFixed(2) + " ℃, " + DT_TRUE.toFixed(2) + " ℃. 나흘 만에 " + Math.abs(DT_TRUE).toFixed(1) + " ℃ 넘게 식었습니다." };
          if (!okD) return { ok: false, msg: "북반구에서는 전향력 때문에 표층 바닷물 전체가 바람 방향의 오른쪽 90° 쪽으로 움직입니다. 남쪽을 보고 섰을 때 오른쪽은 어디인가요?" };
          return { ok: false, msg: "방향은 맞았습니다. 수온 변화 " + dt.toFixed(2) + " ℃는 " + (dt < DT_TRUE ? "너무 많이 내려갔습니다" : "부족합니다") + ". 날짜를 17일과 21일에 놓고 카드의 수온을 읽어 (21일 − 17일)을 구하세요." };
        }
      };
    },
    hints: ["남쪽을 향해 서면 오른손은 서쪽, 곧 먼바다 쪽입니다.", "17일 수온은 15 ℃ 대, 21일은 13 ℃ 대입니다."],
    solution: "에크만 수송은 <b>먼바다(서쪽)</b>, 수온 변화 약 <b>" + DT_TRUE.toFixed(2) + " ℃</b>.",
    why: "바람이 바다 위를 계속 불면, 북반구에서는 전향력 때문에 표층 바닷물 전체가 <b>바람 방향의 오른쪽 90°</b>로 움직입니다(에크만 수송). 해안선을 따라 남쪽으로 바람이 불면 표층의 물이 먼바다로 빠져나가고, 그 빈자리를 <b>아래의 찬물이 올라와</b> 채웁니다. 이것이 <b>연안 용승</b>이에요. 자료에서도 바람이 잦아든 6월 8~17일에는 수온이 올라가다가, 바람이 강해지자 곧바로 식었습니다.<br>"
      + "올라온 찬물에는 영양염이 많아 플랑크톤이 늘고 좋은 어장이 됩니다. 우리나라 동해안에서도 여름에 해안을 따라 북쪽으로 바람(남풍 계열)이 이어지면 표층수가 바람의 오른쪽인 먼바다로 밀려나, 울산·감포 앞바다에 찬물대(냉수대)가 나타나곤 합니다."
  }
  ]
});
})();
