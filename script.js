/* ================= CHEMFLASH v6 — viết lại sạch: êm + nhẹ + đủ tính năng ================= */
"use strict";
const $ = (id) => document.getElementById(id);

/* ---------- 1. DỮ LIỆU 5 NGUYÊN TỐ ---------- */
const ELEMENTS = [
  { name:"Hydrogen", sym:"H", num:1, mass:"1.008", group:"1", period:"1", type:"Phi kim", color:"Xanh dương", c:"#3FA7FF", fun:"Nhẹ nhất bảng tuần hoàn nên được bơm vào khinh khí cầu.", col:1, row:1 },
  { name:"Carbon", sym:"C", num:6, mass:"12.011", group:"14", period:"2", type:"Phi kim", color:"Tím", c:"#9B7BFF", fun:"Vừa là than chì trong bút chì, vừa là kim cương lấp lánh.", col:14, row:2 },
  { name:"Oxygen", sym:"O", num:8, mass:"15.999", group:"16", period:"2", type:"Phi kim", color:"Xanh lá", c:"#3ECF8E", fun:"Mỗi hơi thở của bạn đều có nó. Cây xanh nhả O₂ mỗi ngày.", col:16, row:2 },
  { name:"Sodium", sym:"Na", num:11, mass:"22.990", group:"1", period:"3", type:"Kim loại kiềm", color:"Cam", c:"#FF9F45", fun:"Một nửa của muối ăn. Gặp nước là xèo xèo lách tách.", col:1, row:3 },
  { name:"Chlorine", sym:"Cl", num:17, mass:"35.45", group:"17", period:"3", type:"Halogen", color:"Hồng", c:"#FF7BAC", fun:"Người hùng thầm lặng khử trùng nước hồ bơi.", col:17, row:3 },
];

/* ---------- 2. HÌNH MINH HỌA SVG ---------- */
const ILLUS = {
  H: `<svg class="illus" viewBox="0 0 160 120">
    <ellipse class="float-a" cx="80" cy="52" rx="34" ry="40" fill="#3FA7FF" stroke="#26314B" stroke-width="3.5"/>
    <ellipse cx="68" cy="40" rx="9" ry="13" fill="#fff" opacity=".55"/>
    <text x="80" y="66" text-anchor="middle" font-size="30" font-weight="900" fill="#fff" font-family="Be Vietnam Pro">H₂</text>
    <path d="M80 92 L74 110 M80 92 L86 110" stroke="#26314B" stroke-width="3" fill="none"/>
    <rect class="float-b" x="18" y="88" width="26" height="12" rx="6" fill="#fff" stroke="#26314B" stroke-width="2.5"/>
    <rect class="float-a" x="118" y="92" width="30" height="12" rx="6" fill="#fff" stroke="#26314B" stroke-width="2.5"/>
    <circle class="rise r1" cx="114" cy="30" r="3" fill="#3FA7FF"/>
  </svg>`,
  C: `<svg class="illus" viewBox="0 0 160 120">
    <polygon class="float-a" points="80,18 118,48 80,102 42,48" fill="#9B7BFF" stroke="#26314B" stroke-width="3.5"/>
    <polyline points="42,48 80,62 118,48" fill="none" stroke="#26314B" stroke-width="2.5"/>
    <line x1="80" y1="62" x2="80" y2="102" stroke="#26314B" stroke-width="2.5"/>
    <polygon points="66,30 74,32 80,26 86,32 94,30 88,40 80,44 72,40" fill="#fff" opacity=".8"/>
    <path class="float-b" d="M30 30 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" fill="#FFD23F" stroke="#26314B" stroke-width="2"/>
    <path class="float-a" d="M128 70 l2.4 5.6 5.6 2.4 -5.6 2.4 -2.4 5.6 -2.4 -5.6 -5.6 -2.4 5.6 -2.4z" fill="#FFD23F" stroke="#26314B" stroke-width="2"/>
  </svg>`,
  O: `<svg class="illus" viewBox="0 0 160 120">
    <path class="sway" d="M80 104 C50 90 44 52 84 26 C124 52 112 92 80 104z" fill="#3ECF8E" stroke="#26314B" stroke-width="3.5"/>
    <path d="M80 100 L80 40 M80 66 L64 56 M80 66 L96 56 M80 82 L62 72 M80 82 L98 72" stroke="#26314B" stroke-width="2.5" fill="none"/>
    <path class="float-a" d="M28 78 q10 -12 22 -6 q-10 12 -22 6z" fill="#7DE8B4" stroke="#26314B" stroke-width="2.5"/>
    <circle class="rise r1" cx="126" cy="70" r="4" fill="none" stroke="#26314B" stroke-width="2.5"/>
    <circle class="rise r2" cx="134" cy="56" r="3" fill="none" stroke="#26314B" stroke-width="2.5"/>
  </svg>`,
  Na: `<svg class="illus" viewBox="0 0 160 120">
    <g class="float-a">
      <rect x="52" y="26" width="46" height="40" rx="8" fill="#fff" stroke="#26314B" stroke-width="3.5" transform="rotate(-14 75 46)"/>
      <rect x="60" y="14" width="30" height="14" rx="5" fill="#FFD23F" stroke="#26314B" stroke-width="3" transform="rotate(-14 75 21)"/>
      <text x="72" y="54" text-anchor="middle" font-size="20" font-weight="900" fill="#26314B" font-family="Be Vietnam Pro" transform="rotate(-14 72 54)">Na</text>
    </g>
    <circle class="rise r1" cx="106" cy="68" r="3" fill="#FF9F45" stroke="#26314B" stroke-width="1.6"/>
    <rect class="float-b" x="92" y="96" width="44" height="12" rx="6" fill="#FFD9AE" stroke="#26314B" stroke-width="2.5"/>
    <path class="flick" d="M40 84 q6 -14 0 -26 q10 8 8 22 q6 -6 4 -16 q10 12 2 26z" fill="#FF9F45" stroke="#26314B" stroke-width="2.5"/>
  </svg>`,
  Cl: `<svg class="illus" viewBox="0 0 160 120">
    <path class="float-a" d="M80 16 C62 44 50 62 50 80 a30 30 0 0 0 60 0 C110 62 98 44 80 16z" fill="#7CC7FF" stroke="#26314B" stroke-width="3.5"/>
    <path d="M64 84 a16 16 0 0 0 12 14" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
    <text x="80" y="82" text-anchor="middle" font-size="22" font-weight="900" fill="#fff" font-family="Be Vietnam Pro">Cl</text>
    <path class="float-b" d="M20 104 q8 -8 16 0 t16 0" fill="none" stroke="#26314B" stroke-width="2.5"/>
    <path class="float-a" d="M104 106 q8 -8 16 0 t16 0" fill="none" stroke="#26314B" stroke-width="2.5"/>
    <circle class="rise r1" cx="130" cy="40" r="3" fill="#FF7BAC"/>
  </svg>`,
};

/* ---------- 3. ÂM THANH (Web Audio, không file ngoài) ---------- */
let AC = null, master = null;
let soundOn = localStorage.getItem("cf_sound") !== "off";
let volume = parseInt(localStorage.getItem("cf_vol") || "60", 10);
function actx(){
  if(!AC){
    const A = window.AudioContext || window.webkitAudioContext;
    if(!A) return null;
    AC = new A(); master = AC.createGain();
    master.gain.value = (volume / 100) * 0.6;
    master.connect(AC.destination);
  }
  if(AC.state === "suspended") AC.resume();
  return AC;
}
function tone(f, o){
  o = o || {};
  if(!soundOn) return;
  try{
    const c = actx(); if(!c) return;
    const d = o.d || .15, t0 = c.currentTime + (o.dl || 0);
    const osc = c.createOscillator(), g = c.createGain();
    osc.type = o.t || "sine";
    osc.frequency.setValueAtTime(f, t0);
    if(o.slide) osc.frequency.exponentialRampToValueAtTime(o.slide, t0 + d);
    g.gain.setValueAtTime(.0001, t0);
    g.gain.exponentialRampToValueAtTime(o.v || .25, t0 + .015);
    g.gain.exponentialRampToValueAtTime(.0001, t0 + d);
    osc.connect(g); g.connect(master);
    osc.start(t0); osc.stop(t0 + d + .05);
  }catch(e){}
}
const S = {
  click(){ tone(760, {d:.06, t:"triangle", v:.15}); },
  flip(){ tone(320, {d:.18, v:.16, slide:720}); },
  move(){ tone(520, {d:.08, t:"triangle", v:.14, slide:680}); },
  good(){ const self=this; [523,659,784,1046].forEach(function(f,i){ tone(f,{d:.2, v:.2, dl:i*.09}); }); },
  bad(){ tone(180, {d:.25, t:"sawtooth", v:.09, slide:120}); },
  win(){ [523,587,659,784,880,1046].forEach(function(f,i){ tone(f,{d:.24, t:"triangle", v:.2, dl:i*.11}); }); },
  page(){ tone(440, {d:.07, v:.1, slide:660}); }
};
function setVol(v){ volume = v; localStorage.setItem("cf_vol", v); if(master) master.gain.value = (v/100)*0.6; }

/* ---------- 4. TOAST + CONFETTI ---------- */
function toast(msg){
  const t = document.createElement("div");
  t.className = "toast"; t.textContent = msg;
  $("toasts").appendChild(t);
  setTimeout(function(){ t.remove(); }, 2600);
}
function confetti(n){
  n = n || 40;
  const box = $("confetti"), colors = ["#FFD23F","#FF7BAC","#3ECF8E","#3FA7FF","#9B7BFF"];
  for(let i = 0; i < n; i++){
    const s = document.createElement("span");
    s.className = "cf";
    s.style.left = (Math.random()*100) + "vw";
    s.style.background = colors[i % colors.length];
    s.style.animationDuration = (1.6 + Math.random()*1.4) + "s";
    box.appendChild(s);
    (function(el){ setTimeout(function(){ el.remove(); }, 3200); })(s);
  }
}

/* ---------- 5. LƯU TRỮ (LocalStorage demo) ---------- */
function blankStats(){ return { score:0, best:0, answered:0, correct:0, wrong:0, studied:[], maxCombo:0 }; }
function getUsers(){ try{ return JSON.parse(localStorage.getItem("cf_users") || "{}"); }catch(e){ return {}; } }
function setUsers(u){ localStorage.setItem("cf_users", JSON.stringify(u)); }
function session(){ return localStorage.getItem("cf_session"); }
function hashPw(s){
  let h = 5381; s = "cf::" + s;
  for(let i = 0; i < s.length; i++) h = (((h << 5) + h) + s.charCodeAt(i)) >>> 0;
  return "h" + h.toString(16);
}
function myStats(){
  const u = session(), users = getUsers();
  if(u && users[u]) return users[u].stats;
  try{ return JSON.parse(localStorage.getItem("cf_guest") || "null") || blankStats(); }
  catch(e){ return blankStats(); }
}
function saveStats(st){
  const u = session(), users = getUsers();
  if(u && users[u]){ users[u].stats = st; setUsers(users); }
  else localStorage.setItem("cf_guest", JSON.stringify(st));
  renderHUD();
}
function addStudied(sym){
  const st = myStats();
  if(st.studied.indexOf(sym) < 0){ st.studied.push(sym); saveStats(st); }
  studyProgress(); renderHomeStats(); // không render lại thẻ để giữ mặt đang lật
}
function studyProgress(){
  const st = myStats(), n = st.studied.length;
  $("flashCount").textContent = "Bạn đã khám phá " + n + "/5 nguyên tố";
  $("flashBar").style.width = (n / 5 * 100) + "%";
  $("studyScore").textContent = n * 20;
  $("doneBox").classList.toggle("hidden", n < 5);
  if(n === 5 && !st._cheered){
    st._cheered = true; saveStats(st);
    S.win(); confetti(50); toast("Bạn đã hoàn thành bộ Flashcard! 100/100");
  }
}

/* ---------- 6. INTRO ---------- */
function hideIntro(){
  if($("intro").classList.contains("hide")) return;
  let p = parseInt($("introFill").style.width || "0", 10);
  const iv = setInterval(function(){
    p += 25; $("introFill").style.width = p + "%";
    if(p >= 100){ clearInterval(iv); setTimeout(function(){ $("intro").classList.add("hide"); }, 250); }
  }, 120);
}
window.addEventListener("load", hideIntro);
setTimeout(hideIntro, 4000);

/* ---------- 7. HẠT NỀN (nhẹ: ít hạt, 30fps, màu cache sẵn) ---------- */
let refreshDots = function(){};
(function particles(){
  const cv = $("particles"), c = cv.getContext("2d");
  let W = 0, H = 0, pts = [], col = "#8A93A8";
  function rs(){
    W = cv.width = window.innerWidth;
    H = cv.height = window.innerHeight;
    try{ col = getComputedStyle(document.body).color; }catch(e){}
    const n = window.innerWidth < 640 ? 22 : 36;
    pts = [];
    for(let i = 0; i < n; i++){
      pts.push({ x:Math.random()*W, y:Math.random()*H,
        vx:(Math.random()-.5)*.25, vy:(Math.random()-.5)*.25, r:Math.random()*1.6+.7 });
    }
  }
  rs();
  window.addEventListener("resize", rs);
  refreshDots = rs;
  let last = 0;
  function loop(t){
    requestAnimationFrame(loop);
    if(document.body.classList.contains("calm")) return;
    if(t - last < 33) return;
    last = t;
    c.clearRect(0, 0, W, H);
    c.globalAlpha = .28; c.fillStyle = col;
    for(let i = 0; i < pts.length; i++){
      const a = pts[i];
      a.x += a.vx; a.y += a.vy;
      if(a.x < 0 || a.x > W) a.vx *= -1;
      if(a.y < 0 || a.y > H) a.vy *= -1;
      c.beginPath(); c.arc(a.x, a.y, a.r, 0, 7); c.fill();
    }
    c.globalAlpha = 1;
  }
  requestAnimationFrame(loop);
})();

/* ---------- 8. HIỆN DẦN KHI CUỘN ---------- */
const io = ("IntersectionObserver" in window)
  ? new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold:.12 })
  : null;
function watchReveals(){
  document.querySelectorAll("[data-reveal]:not(.in)").forEach(function(el){
    if(io) io.observe(el); else el.classList.add("in");
  });
}

/* ---------- 9. TICKER ---------- */
function renderTicker(){
  const one = ELEMENTS.map(function(e){ return e.sym + " • " + e.name.toUpperCase() + " • Z=" + e.num; }).join("  ★  ");
  $("tickerIn").innerHTML = (one + "  ★  ").repeat(4);
}

/* ---------- 10. ĐIỀU HƯỚNG SPA ---------- */
function go(page){
  document.querySelectorAll(".page").forEach(function(s){ s.classList.remove("active"); });
  $("page-" + page).classList.add("active");
  document.querySelectorAll(".nav-link").forEach(function(b){ b.classList.toggle("active", b.dataset.nav === page); });
  $("nav").classList.remove("open");
  S.page();
  if(page === "ranks") renderRanks();
  if(page === "account") renderAccount();
  if(page === "home") renderHomeStats();
  window.scrollTo({ top:0, behavior:"smooth" });
}
document.querySelectorAll("[data-nav]").forEach(function(b){
  b.addEventListener("click", function(){ go(b.dataset.nav); });
});
$("burger").addEventListener("click", function(){ $("nav").classList.toggle("open"); S.click(); });

/* ---------- 11. THEME + CHẾ ĐỘ ÊM ---------- */
function initTheme(){
  const t = localStorage.getItem("cf_theme") || "light";
  document.documentElement.setAttribute("data-theme", t);
  $("themeBtn").textContent = (t === "dark") ? "☀️" : "🌙";
}
$("themeBtn").addEventListener("click", function(){
  const n = (document.documentElement.getAttribute("data-theme") === "dark") ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", n);
  localStorage.setItem("cf_theme", n);
  $("themeBtn").textContent = (n === "dark") ? "☀️" : "🌙";
  S.click(); refreshDots();
});
function initCalm(){
  const calm = localStorage.getItem("cf_calm") === "1";
  document.body.classList.toggle("calm", calm);
  $("calmBtn").textContent = calm ? "Đang tắt" : "Đang bật";
}
$("calmBtn").addEventListener("click", function(){
  const calm = !document.body.classList.contains("calm");
  document.body.classList.toggle("calm", calm);
  localStorage.setItem("cf_calm", calm ? "1" : "0");
  $("calmBtn").textContent = calm ? "Đang tắt" : "Đang bật";
  S.click();
  toast(calm ? "Đã tắt chuyển động nền cho êm." : "Đã bật chuyển động nền.");
});

/* ---------- 12. ÂM THANH UI ---------- */
function syncSound(){
  $("soundBtn").textContent = soundOn ? "🔊" : "🔇";
  $("muteBtn").textContent = soundOn ? "Tắt tiếng" : "Bật tiếng";
}
$("soundBtn").addEventListener("click", function(){
  soundOn = !soundOn;
  localStorage.setItem("cf_sound", soundOn ? "on" : "off");
  syncSound(); if(soundOn) S.click();
});
$("muteBtn").addEventListener("click", function(){
  soundOn = !soundOn;
  localStorage.setItem("cf_sound", soundOn ? "on" : "off");
  syncSound();
});
$("vol").value = volume;
$("vol").addEventListener("input", function(e){ setVol(+e.target.value); });
document.addEventListener("pointerdown", function(){ actx(); }, { once:true });

/* ---------- 13. TÀI KHOẢN ---------- */
let authMode = "login";
function setAuth(m){
  authMode = m;
  $("tLogin").classList.toggle("active", m === "login");
  $("tReg").classList.toggle("active", m === "register");
  $("regExtra").classList.toggle("hidden", m === "login");
  $("aGo").textContent = (m === "login") ? "Đăng nhập" : "Tạo tài khoản";
  $("aErr").textContent = "";
}
$("tLogin").addEventListener("click", function(){ setAuth("login"); S.click(); });
$("tReg").addEventListener("click", function(){ setAuth("register"); S.click(); });
$("aGo").addEventListener("click", function(){
  const u = $("aUser").value.trim(), p = $("aPass").value, p2 = $("aPass2").value;
  const err = $("aErr"), users = getUsers();
  if(!u || !p){ err.textContent = "Đừng bỏ trống tên và mật khẩu nhé."; return; }
  if(authMode === "register"){
    if(p.length < 4){ err.textContent = "Mật khẩu phải ít nhất 4 ký tự."; return; }
    if(p !== p2){ err.textContent = "Hai ô mật khẩu chưa giống nhau."; return; }
    if(users[u]){ err.textContent = "Tên này có người dùng rồi, đổi tên khác nhé."; return; }
    users[u] = { hash:hashPw(p), created:Date.now(), stats:blankStats() };
    setUsers(users);
    localStorage.setItem("cf_session", u);
    toast("Tạo tài khoản thành công, chào bạn mới!");
    S.win(); renderAccount(); renderHUD();
  }else{
    if(!users[u] || users[u].hash !== hashPw(p)){ err.textContent = "Sai tên hoặc mật khẩu rồi."; S.bad(); return; }
    localStorage.setItem("cf_session", u);
    toast("Chào mừng trở lại, " + u + "!");
    S.good(); renderAccount(); renderHUD();
  }
});
$("logout").addEventListener("click", function(){
  localStorage.removeItem("cf_session");
  toast("Đã đăng xuất."); S.click(); renderAccount(); renderHUD();
});
function renderAccount(){
  const u = session(), users = getUsers();
  const logged = u && users[u];
  $("authForms").classList.toggle("hidden", !!logged);
  $("authInfo").classList.toggle("hidden", !logged);
  if(logged){
    $("meName").textContent = u;
    const st = users[u].stats;
    const acc = st.answered ? Math.round(st.correct / st.answered * 100) : 0;
    $("meMeta").textContent = "Tổng " + st.score + " điểm • Đúng " + st.correct + " • Sai " + st.wrong + " • Đúng " + acc + "%";
    $("meStats").innerHTML =
      "<div><b>" + st.score + "</b><span>tổng điểm</span></div>" +
      "<div><b>" + st.best + "</b><span>cao nhất</span></div>" +
      "<div><b>" + st.correct + "</b><span>câu đúng</span></div>" +
      "<div><b>x" + (st.maxCombo || 0) + "</b><span>combo cao nhất</span></div>";
  }
}

/* ---------- 14. TRANG CHỦ ---------- */
function renderHome(){
  $("homeElements").innerHTML = "";
  ELEMENTS.forEach(function(el, i){
    const d = document.createElement("div");
    d.className = "el-card";
    d.style.setProperty("--ec", el.c);
    d.setAttribute("data-reveal", "");
    d.innerHTML = '<div class="el-tag"></div><div class="el-num">Z = ' + el.num + '</div>' +
      '<div class="el-illus">' + ILLUS[el.sym] + '</div>' +
      '<div class="el-sym">' + el.sym + '</div><div class="el-name">' + el.name + '</div>' +
      '<div class="el-go">học ngay →</div>';
    d.addEventListener("click", function(){ S.click(); flashIdx = i; go("flash"); renderFlash(); });
    $("homeElements").appendChild(d);
  });
  watchReveals();
}
function renderHomeStats(){
  const st = myStats();
  $("statBest").textContent = st.best;
  $("statAcc").textContent = (st.answered ? Math.round(st.correct / st.answered * 100) : 0) + "%";
}
function renderHUD(){
  $("hudScore").textContent = myStats().score;
  $("qBest").textContent = myStats().best;
}

/* ---------- 15. FLASHCARD ---------- */
let flashIdx = 0, flipped = false;
function renderFlash(){
  const el = ELEMENTS[flashIdx];
  flipped = false;
  $("card").classList.remove("flip");
  document.querySelector("#card .front").style.setProperty("--ec", el.c);
  document.querySelector("#card .back").style.setProperty("--ec", el.c);
  $("fNum").textContent = "Z = " + el.num;
  $("fIllus").innerHTML = ILLUS[el.sym];
  $("fSym").textContent = el.sym;
  $("fName").textContent = el.name;
  $("bSym").textContent = el.sym;
  $("bName").textContent = el.name.toUpperCase();
  $("bNum").textContent = el.num;
  $("bMass").textContent = el.mass;
  $("bGroup").textContent = el.group;
  $("bPeriod").textContent = el.period;
  $("bType").textContent = el.type;
  $("bColor").textContent = el.color;
  $("bFun").textContent = el.fun;
  studyProgress();
}
function flip(){
  flipped = !flipped;
  $("card").classList.toggle("flip", flipped);
  S.flip();
  if(flipped) addStudied(ELEMENTS[flashIdx].sym);
}
$("card").addEventListener("click", flip);
$("flipEl").addEventListener("click", flip);
$("card").addEventListener("keydown", function(e){
  if(e.key === "Enter" || e.key === " "){ e.preventDefault(); flip(); }
  if(e.key === "ArrowRight") $("nextEl").click();
  if(e.key === "ArrowLeft") $("prevEl").click();
});
$("nextEl").addEventListener("click", function(){ flashIdx = (flashIdx + 1) % ELEMENTS.length; S.move(); renderFlash(); });
$("prevEl").addEventListener("click", function(){ flashIdx = (flashIdx - 1 + ELEMENTS.length) % ELEMENTS.length; S.move(); renderFlash(); });
let tx = null;
$("card").addEventListener("touchstart", function(e){ tx = e.touches[0].clientX; }, { passive:true });
$("card").addEventListener("touchend", function(e){
  if(tx === null) return;
  const dx = e.changedTouches[0].clientX - tx;
  if(Math.abs(dx) > 45) (dx < 0 ? $("nextEl") : $("prevEl")).click();
  tx = null;
}, { passive:true });

/* ---------- 16. BẢNG TUẦN HOÀN ---------- */
let selPT = 0;
function renderTable(){
  const g = $("ptable");
  g.innerHTML = "";
  for(let r = 1; r <= 3; r++) for(let c = 1; c <= 18; c++){
    const el = ELEMENTS.find(function(e){ return e.row === r && e.col === c; });
    const d = document.createElement("div");
    d.className = "pt-cell" + (el ? " on" : "");
    if(el){
      d.style.setProperty("--ec", el.c);
      d.innerHTML = "<small>" + el.num + "</small>" + el.sym;
      (function(one){ d.addEventListener("click", function(){ selectPT(one); }); })(el);
    }
    g.appendChild(d);
  }
  selectPT(ELEMENTS[selPT]);
}
function selectPT(el){
  selPT = ELEMENTS.indexOf(el);
  document.querySelectorAll(".pt-cell.on").forEach(function(x){ x.classList.remove("sel"); });
  const cells = document.querySelectorAll(".pt-cell.on");
  if(cells[selPT]) cells[selPT].classList.add("sel");
  $("pdetail").classList.remove("hidden");
  $("pdIllus").innerHTML = ILLUS[el.sym];
  $("pdName").textContent = el.name;
  $("pdMeta").textContent = "Z=" + el.num + " • Nhóm " + el.group + " • Chu kỳ " + el.period + " • " + el.type;
  $("pdFun").textContent = el.fun;
  S.click();
}
$("pdStudy").addEventListener("click", function(){ flashIdx = selPT; go("flash"); renderFlash(); });

/* ---------- 17. QUIZ ---------- */
function rnd(a){ return a[Math.floor(Math.random() * a.length)]; }
function shuffle(a){
  for(let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}
function makeQ(){
  const el = rnd(ELEMENTS), t = Math.floor(Math.random() * 5);
  const names = ELEMENTS.map(function(e){ return e.name; });
  if(t === 0) return { q:"Nguyên tố nào có ký hiệu " + el.sym + "?",
    opts:shuffle([el.name].concat(shuffle(names.filter(function(n){ return n !== el.name; })).slice(0, 3))), ans:el.name };
  if(t === 1){
    const e2 = rnd(ELEMENTS);
    return { q:"Ký hiệu của " + e2.name + " là gì?",
      opts:shuffle([e2.sym].concat(shuffle(ELEMENTS.map(function(e){ return e.sym; }).filter(function(s){ return s !== e2.sym; })).slice(0, 3))), ans:e2.sym };
  }
  if(t === 2){
    const e2 = rnd(ELEMENTS);
    const pool = shuffle(ELEMENTS.map(function(e){ return e.num; }).filter(function(n){ return n !== e2.num; })).slice(0, 3);
    return { q:e2.name + " (" + e2.sym + ") có số hiệu nguyên tử là bao nhiêu?",
      opts:shuffle([e2.num].concat(pool)).map(String), ans:String(e2.num) };
  }
  if(t === 3){
    const e2 = rnd(ELEMENTS);
    const pool = shuffle(ELEMENTS.map(function(e){ return e.mass; }).filter(function(m){ return m !== e2.mass; })).slice(0, 3);
    return { q:"Nguyên tử khối gần đúng của " + e2.name + " là?",
      opts:shuffle([e2.mass].concat(pool)), ans:e2.mass };
  }
  const e2 = rnd(ELEMENTS);
  return { q:e2.name + " thuộc nhóm / chu kỳ nào?",
    opts:shuffle(["Nhóm " + e2.group + " – Chu kỳ " + e2.period].concat(
      shuffle(ELEMENTS.filter(function(e){ return e !== e2; })
        .map(function(e){ return "Nhóm " + e.group + " – Chu kỳ " + e.period; })).slice(0, 3))),
    ans:"Nhóm " + e2.group + " – Chu kỳ " + e2.period };
}
let QQ = [], qi = 0, qScore = 0, streak = 0, qLock = false;
$("startQuiz").addEventListener("click", function(){
  QQ = []; for(let i = 0; i < 10; i++) QQ.push(makeQ());
  qi = 0; qScore = 0; streak = 0;
  $("quizSetup").classList.add("hidden");
  $("quizResult").classList.add("hidden");
  $("quizBox").classList.remove("hidden");
  S.click(); renderQ();
});
function renderQ(){
  qLock = false;
  const q = QQ[qi];
  $("qBar").style.width = (qi / 10 * 100) + "%";
  $("qCount").textContent = "Câu " + (qi + 1) + "/10";
  $("qText").textContent = q.q;
  $("qFeed").textContent = "";
  $("qFeed").className = "q-feed";
  $("quizNextBtn").classList.add("hidden");
  $("qScore").textContent = qScore;
  const box = $("qOpts");
  box.innerHTML = "";
  const L = ["A", "B", "C", "D"];
  q.opts.forEach(function(o, i){
    const b = document.createElement("button");
    b.className = "q-opt";
    b.textContent = L[i] + ". " + o;
    b.addEventListener("click", function(){ answer(o, b); });
    box.appendChild(b);
  });
}
function answer(pick, btn){
  if(qLock) return;
  qLock = true;
  const q = QQ[qi], st = myStats();
  document.querySelectorAll(".q-opt").forEach(function(b){ b.disabled = true; });
  st.answered++;
  if(pick === q.ans){
    btn.classList.add("ok");
    qScore += 10; streak++;
    st.correct++; st.score += 10;
    if(streak >= 2){ $("qCombo").classList.remove("hidden"); $("qCombo").textContent = "COMBO x" + streak; }
    if(streak === 5) toast("COMBO x5 — cháy quá!");
    $("qFeed").textContent = "Chính xác! Bạn hiểu bài thật đấy.";
    $("qFeed").classList.add("ok");
    S.good(); confetti(24);
  }else{
    btn.classList.add("bad");
    streak = 0;
    $("qCombo").classList.add("hidden");
    st.wrong++;
    document.querySelectorAll(".q-opt").forEach(function(b){ if(b.textContent.indexOf(q.ans) >= 0) b.classList.add("ok"); });
    $("qFeed").textContent = "Chưa đúng rồi. Đáp án là: " + q.ans;
    $("qFeed").classList.add("no");
    S.bad();
  }
  st.maxCombo = Math.max(st.maxCombo || 0, streak);
  if(qScore > st.best) st.best = qScore;
  saveStats(st);
  $("qBar").style.width = ((qi + 1) / 10 * 100) + "%";
  $("quizNextBtn").classList.remove("hidden");
}
$("quizNextBtn").addEventListener("click", function(){
  S.click();
  if(qi < QQ.length - 1){ qi++; renderQ(); return; }
  $("quizBox").classList.add("hidden");
  $("quizResult").classList.remove("hidden");
  $("quizScore").textContent = qScore;
  let m;
  if(qScore === 100) m = "PERFECT 10/10 — phong Nhà giả kim!";
  else if(qScore >= 80) m = "Xuất sắc, suýt PERFECT!";
  else if(qScore >= 50) m = "Khá rồi, lật thêm flashcard nhé.";
  else m = "Đừng nản, học lại thẻ rồi quay lại.";
  $("quizMessage").textContent = "Bạn đạt " + qScore + "/100. " + m;
  if(qScore === 100){ S.win(); confetti(80); }
  else if(qScore >= 50) S.good();
  $("quizSetup").classList.remove("hidden");
});
$("quizRetryBtn").addEventListener("click", function(){ $("startQuiz").click(); });

/* ---------- 18. THÀNH TÍCH ---------- */
const BADGES = [
  { i:"🥉", n:"Tập sự", d:"Trả lời đúng 1 câu", ok:function(s){ return s.correct >= 1; } },
  { i:"🥈", n:"Nhà khám phá", d:"Học đủ 5 flashcard", ok:function(s){ return s.studied.length >= 5; } },
  { i:"🥇", n:"Bậc thầy", d:"Điểm cao nhất từ 80", ok:function(s){ return s.best >= 80; } },
  { i:"⚗", n:"Nhà giả kim", d:"PERFECT 100 điểm", ok:function(s){ return s.best >= 100; } }
];
function renderRanks(){
  const st = myStats();
  const acc = st.answered ? Math.round(st.correct / st.answered * 100) : 0;
  $("rankGrid").innerHTML =
    "<div><b>" + st.score + "</b><span>tổng điểm</span></div>" +
    "<div><b>" + st.best + "</b><span>điểm cao nhất</span></div>" +
    "<div><b>" + st.answered + "</b><span>câu đã làm</span></div>" +
    "<div><b>" + st.correct + "</b><span>câu đúng</span></div>" +
    "<div><b>" + st.wrong + "</b><span>câu sai</span></div>" +
    "<div><b>" + acc + "%</b><span>tỉ lệ đúng</span></div>" +
    "<div><b>" + st.studied.length + "/5</b><span>thẻ đã học</span></div>" +
    "<div><b>x" + (st.maxCombo || 0) + "</b><span>combo cao nhất</span></div>";
  $("badgeGrid").innerHTML = BADGES.map(function(b){
    const un = b.ok(st);
    return '<div class="badge' + (un ? " un" : "") + '"><div class="bi">' + b.i + "</div><b>" + b.n +
      "</b><small>" + b.d + "</small><small>" + (un ? "Đã mở khóa" : "Chưa mở") + "</small></div>";
  }).join("");
}

/* ---------- 19. KHỞI ĐỘNG ---------- */
setAuth("login");
initTheme();
initCalm();
syncSound();
renderTicker();
renderHome();
renderFlash();
renderTable();
renderRanks();
renderAccount();
renderHUD();
renderHomeStats();
watchReveals();
