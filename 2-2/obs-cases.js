/* 지구시스템과학2 Ⅱ-2 강수 과정과 대기의 운동 — '실제 자료' 탭 (2026-11-27)
   o1 포항 하늘의 기온 역전층 — 라디오존데 관측으로 역전층의 밑면·윗면 찾고 안정도 판단
   o2 높이 차로 바람 세기 맞히기 — 500 hPa 등압면 높이의 남북 차로 지균풍 계산, 실제 바람과 비교
   o3 제트 기류는 언제, 어디서 가장 셀까 — 250 hPa 바람의 1월·7월 평균(동경 128°)
   자료: data/obs-sounding.js (기상청 포항 고층 관측, 와이오밍 대학교 자료실), data/obs-upper.js (Open-Meteo · ECMWF IFS) — 받은 날 2026-11-27
   이야기 탭 안의 '📊 실제 자료'(real-cases.js: NASA POWER 기온·이슬점, 부산·라싸 기압, 창원 강수)와 겹치지 않는 자료만 쓴다. */
(function () {
"use strict";
var K = window.sthKit, LT = K.LT;
var SO = (window.OBS_SOUNDING || { rows: [] }).rows;                 /* [z, p, T, Td] */
var UPR = window.OBS_UPPER || { z500: { rows: [] }, jet: { jan: { rows: [] }, jul: { rows: [] } } };
var ZR = UPR.z500.rows, JAN = UPR.jet.jan.rows, JUL = UPR.jet.jul.rows;

function card(ctx, x, W, CH, title, rows, tip, good) {
  K.card(ctx, x, 8, W - x - 8, CH - 16, null);              /* 제목은 자료 종류 배지(오른쪽 위) 아래로 */
  K.t(ctx, title, x + 16, 50, { s: 12, w: "800", c: LT.mute });
  rows.forEach(function (r, i) { K.row(ctx, r[0], r[1], x + 16, W - 24, 80 + i * 27, r[2]); });
  if (tip) K.tip(ctx, tip, x + 12, CH - 56, W - x - 32, good);
}
function hline(ctx, g, y, col, lab, left) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
  ctx.beginPath(); ctx.moveTo(g.L, g.Y(y)); ctx.lineTo(g.R, g.Y(y)); ctx.stroke(); ctx.restore();
  if (lab) K.t(ctx, lab, left ? g.L + 6 : g.R - 4, g.Y(y) - 5, { s: 11, w: "800", a: left ? "left" : "right", c: col });
}
function src(s) { return "<small>출처: " + s + " · 받은 날 2026-11-27 · 사본은 이 저장소의 data/ 폴더.</small>"; }

/* ---- o1 계산값: 1 km 아래에서 가장 찬 곳 = 역전층 밑면, 그 위 1.5 km 안에서 가장 따뜻한 곳 = 윗면 ---- */
var BOT = 0, TOP = 0;
(function () {
  var i, b = -1, t = -1;
  for (i = 0; i < SO.length && SO[i][0] <= 1000; i++) if (b < 0 || SO[i][2] < SO[b][2]) b = i;
  for (i = b; i >= 0 && i < SO.length && SO[i][0] <= 1500; i++) if (t < 0 || SO[i][2] > SO[t][2]) t = i;
  BOT = b; TOP = t;
})();
function rowAt(z) { var best = 0; SO.forEach(function (r, i) { if (Math.abs(r[0] - z) < Math.abs(SO[best][0] - z)) best = i; }); return SO[best] || [0, 0, 0, 0]; }
var ZB = SO.length ? SO[BOT][0] : 300, ZT = SO.length ? SO[TOP][0] : 600;
var GAM_IN = SO.length ? (SO[BOT][2] - SO[TOP][2]) / ((ZT - ZB) / 1000) : -20;        /* 기온 감률 ℃/km (역전이면 음수) */
function zr(z) { return Math.round(z / 50) * 50; }             /* 화면 글에는 50 m 단위로 */
var R15 = rowAt(1500), GAM_UP = SO.length ? (SO[TOP][2] - R15[2]) / ((R15[0] - ZT) / 1000) : 6;
var GAM_LO = SO.length ? (SO[0][2] - SO[BOT][2]) / ((ZB - SO[0][0]) / 1000) : 8;

/* ---- o2 계산값 ---- */
function zAt(lat) { for (var i = 0; i < ZR.length; i++) if (ZR[i][0] === lat) return ZR[i]; return null; }
var Z33 = zAt(33) || [33, 0, 0, 0], Z41 = zAt(41) || [41, 0, 0, 0], W37 = zAt(37) || [37, 0, 0, 0];
var DY = 8 * 111.2e3, F37 = 2 * 7.292e-5 * Math.sin(37 * Math.PI / 180);
var VG = 9.8 * (Z33[1] - Z41[1]) / DY / F37;

/* ---- o3 계산값 ---- */
function core(rows) { var b = rows[0] || [0, 0]; rows.forEach(function (r) { if (r[1] > b[1]) b = r; }); return b; }
var CJ = core(JAN), CU = core(JUL);
function dT(rows) { return rows.length ? rows[0][3] - rows[rows.length - 1][3] : 0; }
function nearCore(rows, lat) { var c = core(rows); var r = rows.filter(function (x) { return x[0] === lat; })[0]; return r && (Math.abs(lat - c[0]) <= 2.5 + 1e-9) && (c[1] - r[1] <= 2); }

window.sthLab({
  mount: "obs", key: "obs", result: "rObs", label: "실제 자료",
  doneNote: "정리하기 탭에서, 실제 관측값이 이야기 속 생각(대기 안정도·지균풍·편서풍)과 어디까지 맞았는지 한 문장으로 적어 보세요.",
  cases: [
  {
    id: "o1", tag: "실제 자료 · 대기 안정도", title: "포항 하늘의 기온 역전층", short: "기온 역전층",
    kind: "obs", kindPos: "tr",
    who: "🎈", name: "포항 고층 기상 관측소",
    say: "“2025년 1월 10일 아침, 강한 한파 속에 저희 관측소가 띄운 <b>라디오존데</b>(풍선에 매단 관측 장비)가 잰 높이별 기온입니다. 보통은 높이 올라갈수록 기온이 내려가죠. 그런데 이날은 <b>올라갈수록 오히려 따뜻해지는 층</b>이 있었습니다. 그 층의 밑면과 윗면을 찾아 주세요.”",
    predict: {
      q: "높이 올라갈수록 기온이 오히려 올라가는 층(기온 역전층)의 공기는 어떨까요?",
      options: ["㉠ 매우 불안정해서 위아래로 잘 섞이고 구름이 잘 생긴다", "㉡ 매우 안정해서 공기가 위아래로 잘 섞이지 않는다", "㉢ 안정도와는 관계가 없다"],
      answer: 1
    },
    task: "① 역전층의 <b>밑면</b>과 <b>윗면</b> 높이를 슬라이더로 맞추고(각각 ± 60 m) ② 역전층 안 공기의 <b>안정도</b>를 고르세요.",
    build: function (stage, api) {
      var cv = api.canvas(320), ctx = cv.ctx, W = cv.W, zb = 0, zt = 1000, stb = "";
      function draw() {
        ctx.clearRect(0, 0, W, cv.H); K.studio(ctx, 0, 0, W, cv.H);
        var g = K.chart(ctx, { x: 4, y: 52, w: 676, h: cv.H - 56, pl: 58, x0: -32, x1: 0, y0: 0, y1: 2000, xt: 8, yt: 4, light: true,
          xf: function (v) { return v.toFixed(0) + " ℃"; }, yf: function (v) { return v.toFixed(0) + " m"; } });
        /* 비교선: 지상에서 출발한 건조 단열선(10 ℃/km)과 습윤 단열선 어림(5 ℃/km) */
        var T0 = SO.length ? SO[0][2] : -10;
        K.plot(ctx, g, [[T0, SO.length ? SO[0][0] : 0], [T0 - 10 * 2, 2000]], LT.orange, { light: true, w: 1.6, dash: [6, 5], glow: false });
        K.plot(ctx, g, [[T0, SO.length ? SO[0][0] : 0], [T0 - 5 * 2, 2000]], LT.teal, { light: true, w: 1.6, dash: [6, 5], glow: false });
        K.t(ctx, "건조 단열 10 ℃/km", g.X(T0 - 10 * 1.85) + 6, g.Y(1850), { s: 10.5, w: "800", c: LT.orange });
        K.t(ctx, "습윤 단열(어림) 5 ℃/km", g.X(T0 - 5 * 1.9) + 6, g.Y(1900), { s: 10.5, w: "800", c: LT.teal });
        /* 고른 층 칠하기 */
        if (zt > zb) { ctx.fillStyle = "rgba(224,49,49,.10)"; ctx.fillRect(g.L, g.Y(zt), g.R - g.L, g.Y(zb) - g.Y(zt)); }
        hline(ctx, g, zb, LT.red, "밑면 " + zb + " m"); hline(ctx, g, zt, LT.violet, "윗면 " + zt + " m");
        K.plot(ctx, g, SO.filter(function (r) { return r[0] <= 2000; }).map(function (r) { return [r[2], r[0]]; }), LT.blue, { light: true, w: 2.8, dots: 2.2 });
        var rb = rowAt(zb), rt = rowAt(zt), gam = zt > zb ? (rb[2] - rt[2]) / ((zt - zb) / 1000) : 0;
        K.bigText(ctx, "고른 층 " + zb + " ~ " + zt + " m", 16, 38, 22, "#ffffff");
        card(ctx, 690, W, cv.H, "포항 · 2025-01-10 09시", [
          ["밑면 기온", rb[2].toFixed(1) + " ℃", LT.red], ["윗면 기온", rt[2].toFixed(1) + " ℃", LT.violet],
          ["층 안 기온 감률", (zt > zb ? gam.toFixed(1) : "–") + " ℃/km", LT.blue], ["지상 기온", T0.toFixed(1) + " ℃"],
          ["내 판단", stb || "–", LT.blue]
        ], gam < 0 ? "올라갈수록 따뜻해짐(음수)" : "올라갈수록 추워짐", gam < 0 ? true : null);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "① 역전층 밑면 높이", min: 0, max: 1500, step: 50, value: 0, fmt: function (x) { return x + " m"; }, onInput: function (x) { zb = x; api.changed(); draw(); } });
      api.slider({ label: "① 역전층 윗면 높이", min: 0, max: 1500, step: 50, value: 1000, fmt: function (x) { return x + " m"; }, onInput: function (x) { zt = x; api.changed(); draw(); } });
      api.seg({ label: "② 역전층 안 공기의 안정도", value: "", options: [{ v: "절대 불안정", t: "절대 불안정" }, { v: "조건부 불안정", t: "조건부 불안정" }, { v: "절대 안정", t: "절대 안정" }], onPick: function (x) { stb = x; api.changed(); draw(); } });
      api.info("세로축이 높이(해발), 가로축이 기온입니다. 파란 선이 <b>왼쪽 위로</b> 가면 올라갈수록 추워지는 것이고, <b>오른쪽 위로</b> 꺾이면 올라갈수록 따뜻해지는 것입니다. 1,500 m 아래는 50 m마다, 그 위는 250 m마다 점을 찍었고 그림은 2,000 m까지만 보입니다(자료 사본에는 5,000 m까지). "
        + src("기상청 포항 고층기상관측소(47138) 라디오존데 관측, 2025년 1월 10일 00시(세계시, 한국 시각 09시), 미국 와이오밍 대학교 고층 관측 자료실(weather.uwyo.edu)에서 받음"));
      draw();
      return {
        judge: function () {
          var okB = Math.abs(zb - ZB) <= 60, okT = Math.abs(zt - ZT) <= 60, okS = stb === "절대 안정";
          if (okB && okT && okS) return { ok: true, msg: "역전층 약 " + zr(ZB) + " ~ " + zr(ZT) + " m: 기온이 " + SO[BOT][2].toFixed(1) + " ℃ → " + SO[TOP][2].toFixed(1) + " ℃로 " + (SO[TOP][2] - SO[BOT][2]).toFixed(1) + " ℃ 올랐습니다. 기온 감률 " + GAM_IN.toFixed(0) + " ℃/km(음수)로 습윤 단열 감률보다도 훨씬 작으니 절대 안정입니다." };
          if (!okB || !okT) return { ok: false, msg: (!okB ? "밑면 " + zb + " m는 " + (zb < ZB ? "낮습니다" : "높습니다") + ". " : "") + (!okT ? "윗면 " + zt + " m는 " + (zt < ZT ? "낮습니다" : "높습니다") + ". " : "") + "파란 선이 가장 왼쪽(가장 찬 곳)에서 오른쪽으로 꺾여 가장 오른쪽(가장 따뜻한 곳)까지 가는 구간을 찾으세요." };
          return { ok: false, msg: "높이는 맞았습니다. 층 안의 기온 감률(음수)을 건조 단열 감률(10 ℃/km)·습윤 단열 감률(약 5 ℃/km)과 견주어 보세요. 둘보다 모두 작으면 어떤 상태인가요?" };
        }
      };
    },
    hints: ["1 km 아래를 보세요. 파란 선이 가장 왼쪽(가장 찬 곳)으로 갔다가 오른쪽으로 꺾이는 높이와, 다시 왼쪽으로 돌아서는 높이를 찾으세요.", "환경 기온 감률 < 습윤 단열 감률이면 절대 안정, 습윤 < 환경 < 건조이면 조건부 불안정, 환경 > 건조이면 절대 불안정."],
    solution: "역전층 약 <b>" + zr(ZB) + " ~ " + zr(ZT) + " m</b>, <b>절대 안정</b>.",
    why: "공기 덩어리가 올라가면 단열 팽창으로 식습니다(불포화 10 ℃/km, 포화 약 5 ℃/km). 그런데 역전층에서는 주위 공기가 올라갈수록 오히려 따뜻해지므로, 밀려 올라간 공기는 늘 주위보다 차고 무거워 제자리로 돌아옵니다. 그래서 역전층은 <b>절대 안정</b>하고, 뚜껑처럼 아래 공기가 위로 섞이지 못하게 막습니다. 겨울 아침 연기나 미세먼지가 낮게 깔려 퍼지지 않는 까닭이에요.<br>"
      + "이 자료에서 역전층 아래(지상 ~ " + zr(ZB) + " m)의 기온 감률은 약 " + GAM_LO.toFixed(1) + " ℃/km, 역전층 위(" + zr(ZT) + " ~ " + zr(R15[0]) + " m)는 약 " + GAM_UP.toFixed(1) + " ℃/km로, 층마다 안정도가 다릅니다. 실제 대기는 교과서 그림처럼 한 가지 기울기가 아니라 여러 층이 포개져 있습니다. 습윤 단열 감률도 실제로는 기온에 따라 달라서(따뜻할수록 작음), 5 ℃/km는 어림값입니다."
  },
  {
    id: "o2", tag: "실제 자료 · 지균풍", title: "높이 차로 바람 세기 맞히기", short: "지균풍",
    kind: "obs calc", kindPos: "tr",
    who: "✈️", name: "항공 기상 센터",
    say: "“같은 날 오전 9시, 동경 128° 선을 따라 남쪽(북위 31°)에서 북쪽(북위 45°)까지 <b>500 hPa 등압면의 높이</b>입니다. 북쪽으로 갈수록 등압면이 낮아지니, 같은 높이에서는 북쪽의 기압이 낮다는 뜻이에요. 북위 33°와 41°의 높이 차로 <b>북위 37° 상공(약 5.5 km)의 지균풍</b>을 구해 실제 바람과 견주어 봅시다.”",
    predict: {
      q: "북반구 상층에서 등압면 높이가 남쪽은 높고 북쪽은 낮다면, 바람은 어느 쪽으로 불까요?",
      options: ["㉠ 높은 남쪽에서 낮은 북쪽으로 곧장 분다(남풍)", "㉡ 등고선과 나란하게, 낮은 쪽을 왼쪽에 두고 서쪽에서 동쪽으로 분다(서풍)", "㉢ 북쪽에서 남쪽으로 분다(북풍)"],
      answer: 1
    },
    task: "지균풍 V = (g ÷ f) × (높이 차 ÷ 거리) 로 ① <b>속력</b>을 구해 맞추고(± 1.5 m/s) ② 바람이 불어오는 <b>방향</b>을 고르세요. g = 9.8 m/s², 북위 37°의 전향 인자 f = 2Ω sin37° ≈ " + (F37 * 1e5).toFixed(2) + " × 10⁻⁵ /s, 위도 1° ≈ 111.2 km.",
    build: function (stage, api) {
      var cv = api.canvas(300), ctx = cv.ctx, W = cv.W, v = 5, dir = "";
      function draw() {
        ctx.clearRect(0, 0, W, cv.H); K.studio(ctx, 0, 0, W, cv.H);
        var g = K.chart(ctx, { x: 4, y: 52, w: 676, h: cv.H - 56, pl: 62, x0: 30, x1: 46, y0: 5300, y1: 5600, xt: 8, yt: 6, light: true,
          xf: function (x) { return "북위 " + x.toFixed(0) + "°"; }, yf: function (y) { return y.toFixed(0) + " m"; } });
        K.plot(ctx, g, ZR.map(function (r) { return [r[0], r[1]]; }), LT.blue, { light: true, w: 2.8, dots: 3.5 });
        [Z33, Z41].forEach(function (r) {
          ctx.fillStyle = "#fff"; ctx.strokeStyle = LT.red; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(g.X(r[0]), g.Y(r[1]), 6, 0, 6.2832); ctx.fill(); ctx.stroke();
          K.pill(ctx, r[1] + " m", g.X(r[0]) + 10, g.Y(r[1]) - 8, { s: 11, bg: "rgba(255,255,255,.92)", c: LT.red, line: "rgba(224,49,49,.4)" });
        });
        K.t(ctx, "남쪽 ← 높다", g.L + 8, g.T + 14, { s: 11, w: "800", c: LT.mute });
        K.t(ctx, "낮다 → 북쪽", g.R - 8, g.B - 8, { s: 11, w: "800", a: "right", c: LT.mute });
        K.bigText(ctx, "지균풍 " + v.toFixed(1) + " m/s " + (dir ? "· " + dir : ""), 16, 38, 22, "#ffffff");
        card(ctx, 690, W, cv.H, "500 hPa · 동경 128°", [
          ["북위 33° 높이", Z33[1] + " m", LT.red], ["북위 41° 높이", Z41[1] + " m", LT.red], ["두 곳 거리", (DY / 1000).toFixed(0) + " km"],
          ["내 답", v.toFixed(1) + " m/s", LT.blue], ["불어오는 쪽", dir || "–", LT.blue]
        ], "V = (g/f)·Δz/Δy", null);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "① 지균풍 속력", min: 0, max: 60, step: 0.5, value: 5, fmt: function (x) { return x.toFixed(1) + " m/s"; }, onInput: function (x) { v = x; api.changed(); draw(); } });
      api.seg({ label: "② 바람이 불어오는 쪽", value: "", options: [{ v: "서풍", t: "서풍" }, { v: "남풍", t: "남풍" }, { v: "북풍", t: "북풍" }, { v: "동풍", t: "동풍" }], onPick: function (x) { dir = x; api.changed(); draw(); } });
      api.info("높이는 그 등압면(500 hPa)이 평균 해수면에서 몇 m 위에 있는지(지오퍼텐셜 고도)입니다. 등압면이 낮은 쪽이 같은 높이에서 기압이 낮은 쪽입니다. "
        + src("Open-Meteo 과거 예보 자료(Historical Forecast API), 유럽중기예보센터(ECMWF) IFS 0.25° 모형 값, 2025년 1월 10일 00시(세계시) 동경 128° 북위 31~45° 500 hPa 높이·풍속·풍향"));
      draw();
      return {
        judge: function () {
          var okV = Math.abs(v - VG) <= 1.5, okD = dir === "서풍";
          var real = "같은 자료의 북위 37° 실제 바람: " + W37[2].toFixed(1) + " m/s, " + W37[3] + "°(서북서)에서 불어옴.";
          if (okV && okD) return { ok: true, msg: "Δz = " + (Z33[1] - Z41[1]) + " m, Δy = " + (DY / 1000).toFixed(0) + " km → V = 9.8 × " + (Z33[1] - Z41[1]) + " ÷ " + DY.toFixed(0) + " ÷ " + F37.toExponential(2) + " ≈ " + VG.toFixed(1) + " m/s, 서풍. " + real };
          if (!okV) return { ok: false, msg: v.toFixed(1) + " m/s는 " + (v < VG ? "작습니다" : "큽니다") + ". 높이 차(m)를 거리(m 단위!)로 나눈 뒤 g를 곱하고 f로 나누세요." };
          return { ok: false, msg: "속력은 맞았습니다. 북반구에서 지균풍은 등압면이 낮은 쪽(여기서는 북쪽)을 왼쪽에 두고 붑니다. 북쪽을 왼쪽에 두고 걸으면 어느 쪽으로 걷게 되나요?" };
        }
      };
    },
    hints: ["높이 차 " + (Z33[1] - Z41[1]) + " m, 거리 8° × 111.2 km = " + (DY / 1000).toFixed(0) + " km = " + DY.toFixed(0) + " m.", "기울기 " + (Z33[1] - Z41[1]) + " ÷ " + DY.toFixed(0) + " ≈ " + ((Z33[1] - Z41[1]) / DY).toExponential(2) + " 에 9.8을 곱하고 f로 나눕니다."],
    solution: "약 <b>" + VG.toFixed(1) + " m/s</b>, <b>서풍</b>(같은 자료의 실제 바람 " + W37[2].toFixed(1) + " m/s).",
    why: "상층에서는 마찰이 거의 없어, 기압 경도력과 전향력이 균형을 이루며 등압선(등고선)과 나란하게 부는 <b>지균풍</b>이 됩니다. 북쪽이 낮으면 기압 경도력은 북쪽, 전향력은 남쪽을 향하고, 바람은 그 둘에 수직인 동쪽으로 붑니다. 그래서 우리나라 상공에는 대체로 <b>서풍(편서풍)</b>이 붑니다(같은 날 북위 43~45°처럼 저기압·고기압 둘레에서는 다른 방향에서 불 때도 있습니다).<br>"
      + "높이 차만으로 계산한 " + VG.toFixed(1) + " m/s는 실제 바람 " + W37[2].toFixed(1) + " m/s와 10 % 안팎으로 맞습니다. 차이가 나는 까닭은 등압선이 곧지 않고 휘어 있어(경도풍), 8° 사이의 평균 기울기가 북위 37°의 기울기와 꼭 같지 않으며, 실제 바람 방향도 정서가 아니라 서북서이기 때문입니다."
  },
  {
    id: "o3", tag: "실제 자료 · 편서풍과 제트 기류", title: "제트 기류는 언제, 어디서 가장 셀까", short: "제트 기류",
    kind: "obs", kindPos: "tr",
    who: "🛫", name: "장거리 항로 운항 팀",
    say: "“동경 128°(우리나라 하늘)를 따라 북위 20°에서 55°까지, 약 10 km 높이(<b>250 hPa</b>) 바람의 <b>한 달 평균 속력</b>입니다. 파란 선은 <b>2025년 1월</b>, 주황 선은 <b>2024년 7월</b>이에요. 바람이 가장 센 곳이 <b>제트 기류</b>의 중심입니다. 계절마다 어디에, 얼마나 세게 있었는지 읽어 주세요.”",
    predict: {
      q: "편서풍(제트 기류)은 겨울과 여름 중 언제 더 셀까요?",
      options: ["㉠ 여름: 햇빛이 강해 공기가 더 활발하니까", "㉡ 겨울: 저위도와 고위도의 기온 차가 커서", "㉢ 계절과 관계없이 비슷하다"],
      answer: 1
    },
    task: "① <b>1월</b> 제트 중심의 위도 ② <b>7월</b> 제트 중심의 위도를 맞추고 ③ 1월 제트 중심의 <b>평균 풍속</b>을 맞추세요(± 3 m/s). 위도는 자료 점(동그라미) 가운데서 고르세요.",
    build: function (stage, api) {
      var cv = api.canvas(300), ctx = cv.ctx, W = cv.W, lw = 45, ls = 25, sp = 30;
      function draw() {
        ctx.clearRect(0, 0, W, cv.H); K.studio(ctx, 0, 0, W, cv.H);
        var g = K.chart(ctx, { x: 4, y: 52, w: 676, h: cv.H - 56, pl: 58, x0: 20, x1: 55, y0: 0, y1: 80, xt: 7, yt: 8, light: true,
          xf: function (x) { return "북위 " + x.toFixed(0) + "°"; }, yf: function (y) { return y.toFixed(0) + " m/s"; } });
        K.plot(ctx, g, JAN.map(function (r) { return [r[0], r[1]]; }), LT.blue, { light: true, w: 2.8, dots: 3 });
        K.plot(ctx, g, JUL.map(function (r) { return [r[0], r[1]]; }), LT.orange, { light: true, w: 2.8, dots: 3 });
        function mark(x, col, lab) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(g.X(x), g.T); ctx.lineTo(g.X(x), g.B); ctx.stroke(); ctx.restore(); K.t(ctx, lab, g.X(x) + 4, g.T + 12, { s: 11, w: "800", c: col }); }
        mark(lw, LT.blue, "1월? " + lw + "°"); mark(ls, LT.orange, "7월? " + ls + "°");
        hline(ctx, g, sp, LT.violet, "1월 풍속? " + sp + " m/s", true);
        K.t(ctx, "── 2025년 1월", g.L + 8, g.B - 8, { s: 11, w: "800", c: LT.blue }); K.t(ctx, "── 2024년 7월", g.L + 100, g.B - 8, { s: 11, w: "800", c: LT.orange });
        K.bigText(ctx, "1월 " + lw + "° · 7월 " + ls + "°", 16, 38, 22, "#ffffff");
        card(ctx, 690, W, cv.H, "250 hPa · 동경 128°", [
          ["1월 중심(내 답)", "북위 " + lw + "°", LT.blue], ["7월 중심(내 답)", "북위 " + ls + "°", LT.orange], ["1월 풍속(내 답)", sp + " m/s", LT.violet],
          ["500 hPa 기온 차", "20°N − 55°N", LT.mute], ["1월 / 7월", dT(JAN).toFixed(0) + " ℃ / " + dT(JUL).toFixed(0) + " ℃"]
        ], "남북 기온 차를 함께 보세요", null);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "① 1월 제트 중심 위도", min: 20, max: 55, step: 2.5, value: 45, fmt: function (x) { return "북위 " + x + "°"; }, onInput: function (x) { lw = x; api.changed(); draw(); } });
      api.slider({ label: "② 7월 제트 중심 위도", min: 20, max: 55, step: 2.5, value: 25, fmt: function (x) { return "북위 " + x + "°"; }, onInput: function (x) { ls = x; api.changed(); draw(); } });
      api.slider({ label: "③ 1월 제트 중심의 평균 풍속", min: 0, max: 90, step: 1, value: 30, fmt: function (x) { return x + " m/s"; }, onInput: function (x) { sp = x; api.changed(); draw(); } });
      api.info("한 달 동안 매시 값(744개)의 평균입니다. 하루하루의 제트는 남북으로 굽이치며 더 세거나 약하지만, 평균을 내면 계절의 모습이 드러납니다. 카드 아래 줄은 같은 경도의 500 hPa 기온을 북위 20°와 55°에서 뺀 값(남북 기온 차)입니다. "
        + src("Open-Meteo 과거 예보 자료(Historical Forecast API), 유럽중기예보센터(ECMWF) IFS 0.25° 모형 값, 동경 128° 북위 20~55° 250 hPa 풍속·500 hPa 기온의 달 평균(2025년 1월, 2024년 7월)"));
      draw();
      return {
        judge: function () {
          var okW = nearCore(JAN, lw), okS = nearCore(JUL, ls), okP = Math.abs(sp - CJ[1]) <= 3;
          if (okW && okS && okP) return { ok: true, msg: "1월: 북위 " + CJ[0] + "°에서 평균 " + CJ[1].toFixed(1) + " m/s. 7월: 북위 " + CU[0] + "° 부근에서 " + CU[1].toFixed(1) + " m/s. 겨울 제트가 약 " + (CJ[1] / CU[1]).toFixed(1) + "배 세고 " + (CU[0] - CJ[0]) + "°쯤 남쪽에 있습니다." };
          if (!okW) return { ok: false, msg: "1월(파란 선)에서 가장 높이 솟은 점의 위도를 다시 읽으세요." };
          if (!okS) return { ok: false, msg: "7월(주황 선)은 봉우리가 낮고 넓습니다. 가장 높은 점 근처의 위도를 고르세요." };
          return { ok: false, msg: "위도는 맞았습니다. 1월 풍속 " + sp + " m/s는 " + (sp < CJ[1] ? "작습니다" : "큽니다") + ". 파란 봉우리의 높이를 세로 눈금으로 읽으세요." };
        }
      };
    },
    hints: ["파란 선 봉우리는 북위 30° 근처, 주황 선 봉우리는 북위 40°를 조금 넘습니다.", "세로 눈금 한 칸이 10 m/s입니다. 파란 봉우리는 70 m/s 선 근처입니다."],
    solution: "1월 중심 <b>북위 " + CJ[0] + "°, 약 " + CJ[1].toFixed(0) + " m/s</b>, 7월 중심 <b>북위 " + CU[0] + "° 부근, 약 " + CU[1].toFixed(0) + " m/s</b>.",
    why: "상층의 서풍은 <b>남북의 기온 차</b>가 클수록 세집니다. 따뜻한 남쪽은 공기 기둥이 부풀어 등압면이 높고, 찬 북쪽은 낮아서, 기온 차가 크면 등압면의 기울기(기압 경도력)도 커지기 때문입니다. 이 자료에서 500 hPa 기온의 남북 차(북위 20°−55°)는 1월 약 " + dT(JAN).toFixed(0) + " ℃, 7월 약 " + dT(JUL).toFixed(0) + " ℃였고, 제트 중심 풍속도 1월이 훨씬 셌습니다.<br>"
      + "겨울에는 찬 공기가 남쪽까지 내려와 기온 차가 가장 큰 곳, 곧 제트의 중심도 남쪽(우리나라 남쪽 하늘)으로 내려옵니다. 여름에는 북쪽으로 올라가고 약해집니다. 겨울에 인천에서 미국으로 가는 비행기가 돌아올 때보다 빨리 도착하는 것도 이 강한 편서풍을 타기 때문입니다."
  }
  ]
});
})();
