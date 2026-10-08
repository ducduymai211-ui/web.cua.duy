/* CHEMFLASH — SPA + Auth + Flashcard + Quiz + Sound + Ranks (ES6, no backend) */
"use strict";
const $ = (id) => document.getElementById(id);

/* ---------- DATA ---------- */
const ELEMENTS = [
  { name:"Hydrogen", sym:"H", num:1, mass:"1.008", group:"1", period:"1", type:"Phi kim", color:"Cyan", c:"#22d3ee", glow:"rgba(34,211,238,.5)", fun:"Hydrogen là nguyên tố nhẹ nhất trong bảng tuần hoàn.", col:1, row:1 },
  { name:"Carbon", sym:"C", num:6, mass:"12.011", group:"14", period:"2", type:"Phi kim", color:"Xanh lá", c:"#34d399", glow:"rgba(52,211,153,.5)", fun:"Carbon là nền tảng của mọi sự sống và kim cương.", col:14, row:2 },
  { name:"Oxygen", sym:"O", num:8, mass:"15.999", group:"16", period:"2", type:"Phi kim", color:"Xanh dương", c:"#60a5fa", glow:"rgba(96,165,250,.5)", fun:"Oxygen chiếm ~21% khí quyển Trái Đất.", col:16, row:2 },
  { name:"Sodium", sym:"Na", num:11, mass:"22.990", group:"1", period:"3", type:"Kim loại kiềm", color:"Vàng cam", c:"#fbbf24", glow:"rgba(251,191,36,.5)", fun:"Sodium phản ứng mạnh với nước, có trong muối ăn.", col:1, row:3 },
  { name:"Chlorine", sym:"Cl", num:17, mass:"35.45", group:"17", period:"3", type:"Halogen", color:"Tím", c:"#a855f7", glow:"rgba(168,85,247,.5)", fun:"Chlorine dùng khử trùng nước và là halogen điển hình.", col:17, row:3 },
];

/* ---------- SOUND MANAGER (Web Audio) ---------- */
let AC=null, master=null;
let soundOn = localStorage.getItem("cf_sound") !== "off";
let volume = parseInt(localStorage.getItem("cf_vol") || "60", 10);
function ctx(){
  if(!AC){
    const A = window.AudioContext || window.webkitAudioContext;
    if(!A) return null;
    AC = new A(); master = AC.createGain();
    master.gain.value = (volume/100)*0.6;
    master.connect(AC.destination);
  }
  if(AC.state==="suspended") AC.resume();
  return AC;
}
function tone(f,{d=.15,t="sine",v=.25,dl=0,slide=null}={}){
  if(!soundOn) return;
  try{
    const c=ctx(); if(!c) return;
    const t0=c.currentTime+dl, o=c.createOscillator(), g=c.createGain();
    o.type=t; o.frequency.setValueAtTime(f,t0);
    if(slide) o.frequency.exponentialRampToValueAtTime(slide,t0+d);
    g.gain.setValueAtTime(.0001,t0);
    g.gain.exponentialRampToValueAtTime(v,t0+.015);
    g.gain.exponentialRampToValueAtTime(.0001,t0+d);
    o.connect(g); g.connect(master); o.start(t0); o.stop(t0+d+.05);
  }catch(e){}
}
const S = {
  click(){ tone(760,{d:.06,t:"triangle",v:.15}); },
  hover(){ tone(1200,{d:.03,v:.04}); },
  flip(){ tone(320,{d:.18,v:.16,slide:720}); },
  move(){ tone(520,{d:.08,t:"triangle",v:.14,slide:680}); },
  good(){ [523,659,784,1046].forEach((f,i)=>tone(f,{d:.2,v:.2,dl:i*.09})); },
  bad(){ tone(180,{d:.25,t:"sawtooth",v:.09,slide:120}); },
  win(){ [523,587,659,784,880,1046].forEach((f,i)=>tone(f,{d:.24,t:"triangle",v:.2,dl:i*.11})); },
  page(){ tone(440,{d:.07,t:"sine",v:.1,slide:660}); },
};
function setVol(v){ volume=v; localStorage.setItem("cf_vol",v); if(master) master.gain.value=(v/100)*0.6; }

/* ---------- TOAST + CONFETTI ---------- */
function toast(msg){
  const t=document.createElement("div"); t.className="toast"; t.textContent=msg;
  $("toasts").appendChild(t); setTimeout(()=>t.remove(),2600);
}
function confetti(n=40){
  const box=$("confetti"), colors=["#22d3ee","#a855f7","#34d399","#fbbf24","#60a5fa"];
  for(let i=0;i<n;i++){
    const s=document.createElement("span"); s.className="cf";
    s.style.left=Math.random()*100+"vw";
    s.style.background=colors[i%colors.length];
    s.style.animationDuration=(1.6+Math.random()*1.4)+"s";
    box.appendChild(s); setTimeout(()=>s.remove(),3200);
  }
}

/* ---------- STORE (LocalStorage) ---------- */
const blankStats = () => ({ score:0, best:0, answered:0, correct:0, wrong:0, studied:[], maxCombo:0 });
function getUsers(){ try{return JSON.parse(localStorage.getItem("cf_users")||"{}")}catch(e){return{}} }
function setUsers(u){ localStorage.setItem("cf_users",JSON.stringify(u)); }
function session(){ return localStorage.getItem("cf_session"); }
function hash(s){ let h=5381; s="cf::"+s; for(let i=0;i<s.length;i++) h=((h<<5)+h+s.charCodeAt(i))>>>0; return "h"+h.toString(16); }
function myStats(){
  const u=session(), users=getUsers();
  if(u && users[u]) return users[u].stats;
  try{ return JSON.parse(localStorage.getItem("cf_guest")||"null") || blankStats(); }catch(e){ return blankStats(); }
}
function saveStats(st){
  const u=session(), users=getUsers();
  if(u && users[u]){ users[u].stats=st; setUsers(users); }
  else localStorage.setItem("cf_guest",JSON.stringify(st));
  renderHUD();
}
function addStudied(sym){
  const st=myStats();
  if(!st.studied.includes(sym)){ st.studied.push(sym); saveStats(st); }
  renderFlash(); renderRanks(); renderHomeStats();
}

/* ---------- INTRO + PARTICLES ---------- */
window.addEventListener("load", hideIntro);
// Dự phòng: nếu font/CDN treo khiến sự kiện load chậm, vẫn tự tắt intro
setTimeout(hideIntro, 4000);
function hideIntro(){
  if($("intro").classList.contains("hide")) return;
  let p = parseInt($("introFill").style.width || "0", 10);
  const iv=setInterval(()=>{ p+=25; $("introFill").style.width=p+"%";
  const cv=$("particles"), c=cv.getContext("2d");
    },120);
}
    pts=Array.from({length: innerWidth<640?35:65},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35,r:Math.random()*1.8+.6}));
  }
  rs(); addEventListener("resize",rs);
  (function loop(){
    c.clearRect(0,0,W,H);
    pts.forEach(a=>{ a.x+=a.vx; a.y+=a.vy;
      if(a.x<0||a.x>W)a.vx*=-1; if(a.y<0||a.y>H)a.vy*=-1;
      c.beginPath(); c.arc(a.x,a.y,a.r,0,7); c.fillStyle="rgba(34,211,238,.55)"; c.fill();
    });
    // nối phân tử nhẹ
    for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){
      const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y, d=dx*dx+dy*dy;
      if(d<12000){ c.beginPath(); c.moveTo(pts[i].x,pts[i].y); c.lineTo(pts[j].x,pts[j].y);
        c.strokeStyle="rgba(168,85,247,.12)"; c.lineWidth=1; c.stroke(); }
    }
    requestAnimationFrame(loop);
  })();
})();

/* ---------- SPA NAV ---------- */
function go(page){
  document.querySelectorAll(".page").forEach(s=>s.classList.remove("active"));
  $("page-"+page).classList.add("active");
  document.querySelectorAll(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.nav===page));
  $("nav").classList.remove("open");
  S.page();
  if(page==="ranks") renderRanks();
  if(page==="account") renderAccount();
  if(page==="home") renderHomeStats();
  window.scrollTo({top:0,behavior:"smooth"});
}
document.querySelectorAll("[data-nav]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.nav)));
$("burger").addEventListener("click",()=>{ $("nav").classList.toggle("open"); S.click(); });

/* ---------- THEME ---------- */
function initTheme(){
  const t=localStorage.getItem("cf_theme")||"dark";
  document.documentElement.setAttribute("data-theme",t);
  $("themeBtn").textContent = t==="dark" ? "☀️" : "🌙";
}
$("themeBtn").addEventListener("click",()=>{
  const c=document.documentElement.getAttribute("data-theme");
  const n=c==="dark"?"light":"dark";
  document.documentElement.setAttribute("data-theme",n);
  localStorage.setItem("cf_theme",n);
  $("themeBtn").textContent=n==="dark"?"☀️":"🌙"; S.click();
});

/* ---------- SOUND UI ---------- */
function syncSound(){ $("soundBtn").textContent=soundOn?"🔊":"🔇"; $("muteBtn").textContent=soundOn?"Tắt tiếng":"Bật tiếng"; }
$("soundBtn").addEventListener("click",()=>{ soundOn=!soundOn; localStorage.setItem("cf_sound",soundOn?"on":"off"); syncSound(); if(soundOn)S.click(); });
$("muteBtn").addEventListener("click",()=>{ soundOn=!soundOn; localStorage.setItem("cf_sound",soundOn?"on":"off"); syncSound(); });
$("vol").value=volume;
$("vol").addEventListener("input",e=>setVol(+e.target.value));
document.addEventListener("pointerdown",()=>ctx(),{once:true});

/* ---------- AUTH ---------- */
let authMode="login";
function setAuth(m){
  authMode=m;
  $("tLogin").classList.toggle("active",m==="login");
  $("tReg").classList.toggle("active",m==="register");
  $("regExtra").classList.toggle("hidden",m==="login");
  $("aGo").textContent=m==="login"?"Đăng nhập":"Tạo tài khoản";
  $("aErr").textContent="";
}
$("tLogin").addEventListener("click",()=>{setAuth("login");S.click();});
$("tReg").addEventListener("click",()=>{setAuth("register");S.click();});
$("aGo").addEventListener("click",()=>{
  const u=$("aUser").value.trim(), p=$("aPass").value, p2=$("aPass2").value;
  const err=$("aErr"), users=getUsers();
  if(!u||!p){ err.textContent="Không được bỏ trống tên và mật khẩu."; return; }
  if(authMode==="register"){
    if(p.length<4){ err.textContent="Mật khẩu phải ít nhất 4 ký tự."; return; }
    if(p!==p2){ err.textContent="Mật khẩu xác nhận chưa giống nhau."; return; }
    if(users[u]){ err.textContent="Tên này đã có người dùng."; return; }
    users[u]={hash:hash(p),created:Date.now(),stats:blankStats()};
    setUsers(users); localStorage.setItem("cf_session",u);
    toast("🎉 Tạo tài khoản thành công!"); S.win(); renderAccount(); renderHUD();
  }else{
    if(!users[u]||users[u].hash!==hash(p)){ err.textContent="❌ Tên hoặc mật khẩu không chính xác!"; S.bad(); return; }
    localStorage.setItem("cf_session",u);
    toast(`👋 Chào mừng trở lại, ${u}!`); S.good(); renderAccount(); renderHUD();
  }
});
$("logout").addEventListener("click",()=>{ localStorage.removeItem("cf_session"); toast("Đã đăng xuất."); S.click(); renderAccount(); renderHUD(); });
function renderAccount(){
  const u=session(), users=getUsers();
  const logged = u && users[u];
  $("authForms").classList.toggle("hidden",!!logged);
  $("authInfo").classList.toggle("hidden",!logged);
  if(logged){
    $("meName").textContent=u;
    const st=users[u].stats;
    const acc = st.answered? Math.round(st.correct/st.answered*100):0;
    $("meMeta").textContent=`Tổng ${st.score} điểm • Đúng ${st.correct} • Sai ${st.wrong} • Chính xác ${acc}%`;
    $("meStats").innerHTML=`
      <div><b>${st.score}</b><span>tổng điểm</span></div>
      <div><b>${st.best}</b><span>cao nhất</span></div>
      <div><b>${st.correct}</b><span>câu đúng</span></div>
      <div><b>${st.maxCombo}</b><span>combo cao nhất</span></div>`;
  }
}

/* ---------- HOME ---------- */
function renderHome(){
  $("homeElements").innerHTML="";
  ELEMENTS.forEach((el,i)=>{
    const d=document.createElement("div");
    d.className="el-card"; d.style.setProperty("--glow",el.glow); d.style.setProperty("--glow-c",el.c);
    d.innerHTML=`<div class="el-num">${el.num}</div><div class="el-sym">${el.sym}</div><div class="el-name">${el.name}</div>`;
    d.addEventListener("click",()=>{ S.click(); flashIdx=i; go("flash"); renderFlash(); });
    $("homeElements").appendChild(d);
  });
}
function renderHomeStats(){
  const st=myStats();
  $("statBest").textContent=st.best;
  $("statAcc").textContent=(st.answered?Math.round(st.correct/st.answered*100):0)+"%";
}
function renderHUD(){ $("hudScore").textContent=myStats().score; $("qBest").textContent=myStats().best; }

/* ---------- FLASHCARD ---------- */
let flashIdx=0, flipped=false;
function renderFlash(){
  const el=ELEMENTS[flashIdx];
  flipped=false; $("card").classList.remove("flip");
  $("fNum").textContent=el.num; $("fSym").textContent=el.sym; $("fSym").style.setProperty("--fc",el.c);
  document.querySelector(".front").style.setProperty("--fc",el.c);
  $("fName").textContent=el.name;
  $("bSym").textContent=el.sym; $("bSym").style.color=el.c;
  $("bName").textContent=el.name.toUpperCase();
  $("bNum").textContent=el.num; $("bMass").textContent=el.mass;
  $("bGroup").textContent=el.group; $("bPeriod").textContent=el.period;
  $("bType").textContent=el.type; $("bColor").textContent=el.color;
  $("bFun").textContent=el.fun;
  const st=myStats();
  const seen = new Set([...st.studied, el.sym]);
  $("flashCount").textContent=`Bạn đã khám phá ${seen.size}/5 nguyên tố`;
  $("flashBar").style.width=(seen.size/5*100)+"%";
  const sc=seen.size*20;
  $("studyScore").textContent=sc;
  $("doneBox").classList.toggle("hidden",seen.size<5);
  if(seen.size===5 && !st._cheered){ st._cheered=true; saveStats(st); S.win(); confetti(50); toast("🎉 Bạn đã hoàn thành bộ Flashcard! 100/100"); }
}
function flip(){
  flipped=!flipped;
  $("card").classList.toggle("flip",flipped); S.flip();
  if(flipped) addStudied(ELEMENTS[flashIdx].sym);
}
$("card").addEventListener("click",flip);
$("flipEl").addEventListener("click",flip);
$("card").addEventListener("keydown",e=>{
  if(e.key==="Enter"||e.key===" "){e.preventDefault();flip();}
  if(e.key==="ArrowRight")$("nextEl").click();
  if(e.key==="ArrowLeft")$("prevEl").click();
});
$("nextEl").addEventListener("click",()=>{ flashIdx=(flashIdx+1)%ELEMENTS.length; S.move(); renderFlash(); });
$("prevEl").addEventListener("click",()=>{ flashIdx=(flashIdx-1+ELEMENTS.length)%ELEMENTS.length; S.move(); renderFlash(); });
let tx=null;
$("card").addEventListener("touchstart",e=>{tx=e.touches[0].clientX},{passive:true});
$("card").addEventListener("touchend",e=>{
  if(tx===null)return; const dx=e.changedTouches[0].clientX-tx;
  if(Math.abs(dx)>45)(dx<0?$("nextEl"):$("prevEl")).click(); tx=null;
},{passive:true});

/* ---------- PERIODIC TABLE ---------- */
let selPT=0;
function renderTable(){
  const g=$("ptable"); g.innerHTML="";
  for(let r=1;r<=3;r++)for(let c=1;c<=18;c++){
    const el=ELEMENTS.find(e=>e.row===r&&e.col===c);
    const d=document.createElement("div");
    d.className="pt-cell"+(el?" on":"");
    if(el){ d.style.setProperty("--glow",el.glow);
      d.innerHTML=`<small>${el.num}</small>${el.sym}`;
      d.addEventListener("click",()=>selectPT(el));
    }
    g.appendChild(d);
  }
  selectPT(ELEMENTS[selPT]);
}
function selectPT(el){
  selPT=ELEMENTS.indexOf(el);
  document.querySelectorAll(".pt-cell.on").forEach(x=>x.classList.remove("sel"));
  [...document.querySelectorAll(".pt-cell.on")][selPT]?.classList.add("sel");
  $("pdetail").classList.remove("hidden");
  $("pdSym").textContent=el.sym; $("pdSym").style.color=el.c;
  $("pdName").textContent=el.name;
  $("pdMeta").textContent=`Z=${el.num} • Nhóm ${el.group} • Chu kỳ ${el.period} • ${el.type}`;
  $("pdFun").textContent="💡 "+el.fun;
  S.click();
}
$("pdStudy").addEventListener("click",()=>{ flashIdx=selPT; go("flash"); renderFlash(); });

/* ---------- QUIZ ---------- */
function rnd(a){ return a[Math.floor(Math.random()*a.length)]; }
function shuffle(a){ for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }
function makeQ(){
  const el=rnd(ELEMENTS), t=Math.floor(Math.random()*5);
  const names=ELEMENTS.map(e=>e.name);
  if(t===0) return {q:`Nguyên tố nào có ký hiệu ${el.sym}?`,opts:shuffle([el.name,...shuffle(names.filter(n=>n!==el.name)).slice(0,3)]),ans:el.name};
  if(t===1){ const e2=rnd(ELEMENTS); return {q:`Ký hiệu của ${e2.name} là gì?`,opts:shuffle([e2.sym,...shuffle(ELEMENTS.map(e=>e.sym).filter(s=>s!==e2.sym)).slice(0,3)]),ans:e2.sym}; }
  if(t===2){ const e2=rnd(ELEMENTS); const pool=shuffle(ELEMENTS.map(e=>e.num).filter(n=>n!==e2.num)).slice(0,3);
    return {q:`${e2.name} (${e2.sym}) có số hiệu nguyên tử là bao nhiêu?`,opts:shuffle([e2.num,...pool]).map(String),ans:String(e2.num)}; }
  if(t===3){ const e2=rnd(ELEMENTS); const pool=shuffle(ELEMENTS.map(e=>e.mass).filter(m=>m!==e2.mass)).slice(0,3);
    return {q:`Nguyên tử khối gần đúng của ${e2.name} là?`,opts:shuffle([e2.mass,...pool]),ans:e2.mass}; }
  const e2=rnd(ELEMENTS);
  return {q:`${e2.name} thuộc nhóm / chu kỳ nào?`,opts:shuffle([`Nhóm ${e2.group} – Chu kỳ ${e2.period}`,...shuffle(ELEMENTS.filter(e=>e!==e2).map(e=>`Nhóm ${e.group} – Chu kỳ ${e.period}`)).slice(0,3)]),ans:`Nhóm ${e2.group} – Chu kỳ ${e2.period}`};
}
let QQ=[],qi=0,qScore=0,streak=0,qLock=false;
$("startQuiz").addEventListener("click",()=>{
  QQ=Array.from({length:10},makeQ); qi=0; qScore=0; streak=0;
  $("quizSetup").classList.add("hidden"); $("quizEnd").classList.add("hidden"); $("quizBox").classList.remove("hidden");
  S.click(); renderQ();
});
function renderQ(){
  qLock=false;
  const q=QQ[qi];
  $("qBar").style.width=(qi/10*100)+"%";
  $("qCount").textContent=`Câu ${qi+1}/10`;
  $("qText").textContent=q.q;
  $("qFeed").textContent=""; $("qFeed").className="q-feed";
  $("qNext").classList.add("hidden");
  $("qScore").textContent=qScore;
  const box=$("qOpts"); box.innerHTML="";
  const L=["A","B","C","D"];
  q.opts.forEach((o,i)=>{
    const b=document.createElement("button"); b.className="q-opt"; b.textContent=`${L[i]}. ${o}`;
    b.addEventListener("click",()=>answer(o,b)); b.addEventListener("mouseenter",()=>S.hover(),{once:true});
    box.appendChild(b);
  });
}
function answer(pick,btn){
  if(qLock)return; qLock=true;
  const q=QQ[qi], st=myStats();
  document.querySelectorAll(".q-opt").forEach(b=>b.disabled=true);
  st.answered++;
  if(pick===q.ans){
    btn.classList.add("ok"); qScore+=10; streak++;
    st.correct++; st.score+=10;
    if(streak>=2){ $("qCombo").classList.remove("hidden"); $("qCombo").textContent=`🔥 COMBO x${streak}`; }
    if(streak===5) toast("🔥 COMBO x5 — tuyệt vời!");
    $("qFeed").textContent="✨ CHÍNH XÁC! Bạn thật sự hiểu Hóa học!";
    $("qFeed").classList.add("ok"); S.good(); confetti(24);
  }else{
    btn.classList.add("bad"); streak=0; $("qCombo").classList.add("hidden");
    st.wrong++;
    document.querySelectorAll(".q-opt").forEach(b=>{ if(b.textContent.includes(q.ans)) b.classList.add("ok"); });
    $("qFeed").textContent=`💥 CHƯA ĐÚNG! Đáp án chính xác là: ${q.ans}`;
    S.bad();
  }
  st.maxCombo=Math.max(st.maxCombo||0,streak);
  if(qScore>st.best)st.best=qScore;
  saveStats(st);
  $("qBar").style.width=((qi+1)/10*100)+"%";
  $("qNext").classList.remove("hidden");
}
$("qNext").addEventListener("click",()=>{
  S.click();
  if(qi<QQ.length-1){ qi++; renderQ(); }
  else{
    $("quizBox").classList.add("hidden"); $("quizEnd").classList.remove("hidden");
    $("qFinal").textContent=qScore;
    let m = qScore===100 ? "🏆 PERFECT! 10/10 — Bậc thầy Hóa học!" : qScore>=80 ? "Xuất sắc! Gần chạm PERFECT." : qScore>=50 ? "Khá tốt! Ôn thêm flashcard nhé." : "Đừng nản, quay lại flashcard rồi thử lại.";
    $("qMsg").textContent=`Bạn đạt ${qScore}/100. ${m}`;
    if(qScore===100){ S.win(); confetti(80); } else if(qScore>=50) S.good();
    $("quizSetup").classList.remove("hidden");
  }
});
$("qRetry").addEventListener("click",()=>$("startQuiz").click());

/* ---------- RANKS ---------- */
const BADGES=[
  {i:"🥉",n:"Nhà hóa học tập sự",d:"Trả lời đúng 1 câu",ok:s=>s.correct>=1},
  {i:"🥈",n:"Nhà khám phá nguyên tố",d:"Học đủ 5 flashcard",ok:s=>s.studied.length>=5},
  {i:"🥇",n:"Bậc thầy Hóa học",d:"Điểm cao nhất ≥ 80",ok:s=>s.best>=80},
  {i:"⚛",n:"Nhà giả kim",d:"PERFECT 100 điểm",ok:s=>s.best>=100},
];
function renderRanks(){
  const st=myStats();
  const acc=st.answered?Math.round(st.correct/st.answered*100):0;
  $("rankGrid").innerHTML=`
    <div><b>${st.score}</b><span>tổng điểm</span></div>
    <div><b>${st.best}</b><span>điểm cao nhất</span></div>
    <div><b>${st.answered}</b><span>số câu đã làm</span></div>
    <div><b>${st.correct}</b><span>số câu đúng</span></div>
    <div><b>${st.wrong}</b><span>số câu sai</span></div>
    <div><b>${acc}%</b><span>tỉ lệ chính xác</span></div>
    <div><b>${st.studied.length}/5</b><span>flashcard đã học</span></div>
    <div><b>x${st.maxCombo||0}</b><span>combo cao nhất</span></div>`;
  $("badgeGrid").innerHTML=BADGES.map(b=>{
    const un=b.ok(st);
    return `<div class="badge${un?" un":""}"><div class="bi">${b.i}</div><b>${b.n}</b><small>${b.d}</small><small>${un?"Đã mở khóa":"Chưa mở"}</small></div>`;
  }).join("");
}

/* ---------- INIT (kiểm tra tất cả) ---------- */
setAuth("login"); initTheme(); syncSound();
renderHome(); renderFlash(); renderTable(); renderRanks(); renderAccount(); renderHUD(); renderHomeStats();
