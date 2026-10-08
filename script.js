/* Periodic Flashcards v2 — audio xịn + auth local + quiz MCQ & Đúng/Sai */

const ELEMENTS = [
  { name: "Hydrogen", symbol: "H", number: 1, mass: "1.008", group: "1", period: "1", type: "Phi kim", electron: "1s¹" },
  { name: "Carbon", symbol: "C", number: 6, mass: "12.011", group: "14", period: "2", type: "Phi kim", electron: "1s² 2s² 2p²" },
  { name: "Oxygen", symbol: "O", number: 8, mass: "15.999", group: "16", period: "2", type: "Phi kim", electron: "1s² 2s² 2p⁴" },
  { name: "Sodium", symbol: "Na", number: 11, mass: "22.990", group: "1", period: "3", type: "Kim loại kiềm", electron: "1s² 2s² 2p⁶ 3s¹" },
  { name: "Chlorine", symbol: "Cl", number: 17, mass: "35.45", group: "17", period: "3", type: "Halogen / Phi kim", electron: "1s² 2s² 2p⁶ 3s² 3p⁵" }
];

const QUIZ_MCQ = [
  { q: "Nguyên tố Carbon (C) có số hiệu nguyên tử là bao nhiêu?", options: ["1", "6", "8", "11"], answer: 1 },
  { q: "Ký hiệu hóa học của Sodium là gì?", options: ["S", "So", "Na", "Sd"], answer: 2 },
  { q: "Nguyên tử khối của Oxygen (O) là bao nhiêu?", options: ["1.008", "12.011", "15.999", "35.45"], answer: 2 },
  { q: "Chlorine (Cl) thuộc nhóm nào và chu kỳ nào?", options: ["Nhóm 1 – Chu kỳ 1", "Nhóm 14 – Chu kỳ 2", "Nhóm 1 – Chu kỳ 3", "Nhóm 17 – Chu kỳ 3"], answer: 3 },
  { q: "Cấu hình electron của Hydrogen (H) là gì?", options: ["1s¹", "1s² 2s² 2p²", "1s² 2s² 2p⁶ 3s¹", "1s² 2s² 2p⁶ 3s² 3p⁵"], answer: 0 }
];

// Quiz Đúng / Sai mới
const QUIZ_TF = [
  { q: "Hydrogen (H) có số hiệu nguyên tử là 1.", answer: true, explain: "H là nguyên tố đầu tiên, Z = 1." },
  { q: "Sodium (Na) là phi kim.", answer: false, explain: "Na là kim loại kiềm, nhóm 1." },
  { q: "Chlorine (Cl) thuộc nhóm 17, chu kỳ 3.", answer: true, explain: "Cl là halogen, nhóm 17." },
  { q: "Nguyên tử khối của Oxygen là 12.011.", answer: false, explain: "12.011 là của Carbon. Oxygen là 15.999." },
  { q: "Carbon (C) có cấu hình electron 1s² 2s² 2p².", answer: true, explain: "Đúng với Z = 6." }
];

// ---------- STATE ----------
let order = [...ELEMENTS.keys()];
let current = 0;
let isFlipped = false;
let quizMode = "mcq"; // 'mcq' | 'tf'
let quizIndex = 0, quizScore = 0, quizAnswered = false;
let authMode = "login";

const $ = (id) => document.getElementById(id);
const homeSection = $("homeSection"), studySection = $("studySection"), quizSection = $("quizSection");
const elementGrid = $("elementGrid"), flashcard = $("flashcard"), flashcardInner = $("flashcardInner");
const progressText = $("progressText"), progressFill = $("progressFill");

// ============================================================
// ÂM THANH XỊN — Web Audio API, nhiều lớp, có envelope
// ============================================================
let soundOn = localStorage.getItem("pf_sound") !== "off";
let audioCtx = null, masterGain = null;

function getCtx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.5;
    // Reverb giả: delay nhẹ cho sang
    const delay = audioCtx.createDelay();
    delay.delayTime.value = 0.09;
    const fb = audioCtx.createGain(); fb.gain.value = 0.22;
    const wet = audioCtx.createGain(); wet.gain.value = 0.18;
    masterGain.connect(audioCtx.destination);
    masterGain.connect(delay); delay.connect(fb); fb.connect(delay);
    delay.connect(wet); wet.connect(audioCtx.destination);
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

// 1 nốt mượt: attack/release, vibrato nhẹ
function tone(freq, { dur = 0.15, type = "sine", vol = 0.25, delay = 0, slideTo = null } = {}) {
  if (!soundOn) return;
  try {
    const ctx = getCtx(); if (!ctx) return;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = type; osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(masterGain);
    osc.start(t0); osc.stop(t0 + dur + 0.05);
  } catch (e) {}
}

// Noise whoosh cho lật/trộn thẻ
function whoosh(delay = 0, dur = 0.22) {
  if (!soundOn) return;
  try {
    const ctx = getCtx(); if (!ctx) return;
    const t0 = ctx.currentTime + delay;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.setValueAtTime(600, t0);
    f.frequency.exponentialRampToValueAtTime(2800, t0 + dur); f.Q.value = 1.1;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.18, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(masterGain);
    src.start(t0);
  } catch (e) {}
}

const soundClick = () => { tone(880, { dur: 0.07, type: "triangle", vol: 0.18 }); tone(1320, { dur: 0.05, vol: 0.08, delay: 0.02 }); };
const soundFlip = () => { whoosh(0, 0.2); tone(320, { dur: 0.18, type: "sine", vol: 0.16, slideTo: 720 }); };
const soundNext = () => { tone(500, { dur: 0.09, type: "triangle", vol: 0.16, slideTo: 680 }); };
const soundShuffle = () => { whoosh(0, 0.3); [523, 659, 784, 1046].forEach((f, i) => tone(f, { dur: 0.1, type: "triangle", vol: 0.14, delay: i * 0.06 })); };
const soundCorrect = () => { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, { dur: 0.22, type: "sine", vol: 0.22, delay: i * 0.09 })); tone(2093, { dur: 0.3, vol: 0.06, delay: 0.36 }); };
const soundWrong = () => { tone(196, { dur: 0.28, type: "sawtooth", vol: 0.1, slideTo: 130 }); tone(98, { dur: 0.3, type: "square", vol: 0.05, delay: 0.05 }); };
const soundWin = () => { [523, 587, 659, 784, 880, 1046].forEach((f, i) => tone(f, { dur: 0.25, type: "triangle", vol: 0.2, delay: i * 0.11 })); };
const soundAuth = () => { tone(660, { dur: 0.12, vol: 0.18 }); tone(990, { dur: 0.2, vol: 0.18, delay: 0.1 }); };

function updateSoundBtn() { $("soundBtn").textContent = soundOn ? "🔊" : "🔇"; }

// ---------- THEME ----------
function initTheme() {
  const saved = localStorage.getItem("pf_theme") || "light";
  document.documentElement.setAttribute("data-theme", saved);
  $("themeBtn").textContent = saved === "dark" ? "☀️" : "🌙";
}
function toggleTheme() {
  const cur = document.documentElement.getAttribute("data-theme");
  const next = cur === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("pf_theme", next);
  $("themeBtn").textContent = next === "dark" ? "☀️" : "🌙";
  soundClick();
}

// ============================================================
// TÀI KHOẢN (localStorage — demo, không thay backend thật)
// ============================================================
function getUsers() { try { return JSON.parse(localStorage.getItem("pf_users") || "{}"); } catch (e) { return {}; } }
function setUsers(u) { localStorage.setItem("pf_users", JSON.stringify(u)); }
function currentUser() { return localStorage.getItem("pf_session") || null; }
function hashPw(s) {
  // băm nhẹ djb2 + salt, chỉ để demo, KHÔNG an toàn thật
  const salt = "pf_h2a::";
  s = salt + s;
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return "h" + h.toString(16);
}
function updateAuthUI() {
  const u = currentUser();
  const chip = $("userChip"), btn = $("authBtn"), welcome = $("welcomeBox");
  if (u) {
    chip.classList.remove("hidden"); btn.classList.add("hidden");
    $("userName").textContent = u;
    $("userAvatar").textContent = "🧪";
    const users = getUsers();
    const me = users[u];
    const best = me ? Math.max(me.bestMCQ || 0, me.bestTF || 0) : 0;
    welcome.classList.remove("hidden");
    welcome.textContent = `👋 Chào ${u}! Điểm cao nhất của bạn: ${best}/5 — cố lên!`;
  } else {
    chip.classList.add("hidden"); btn.classList.remove("hidden");
    welcome.classList.add("hidden");
  }
}
function openAuth() { $("authOverlay").classList.remove("hidden"); $("authError").textContent = ""; soundClick(); }
function closeAuth() { $("authOverlay").classList.add("hidden"); }
function setAuthMode(m) {
  authMode = m;
  $("tabLogin").classList.toggle("active", m === "login");
  $("tabRegister").classList.toggle("active", m === "register");
  $("authSubmit").textContent = m === "login" ? "Đăng nhập" : "Tạo tài khoản";
}
function submitAuth() {
  const u = $("authUser").value.trim();
  const p = $("authPass").value;
  const err = $("authError");
  if (!/^[a-zA-Z0-9_.]{3,24}$/.test(u)) { err.textContent = "Tên đăng nhập 3–24 ký tự, chỉ chữ/số/._"; return; }
  if (p.length < 4) { err.textContent = "Mật khẩu ít nhất 4 ký tự."; return; }
  const users = getUsers();
  if (authMode === "register") {
    if (users[u]) { err.textContent = "Tên này đã có người dùng, chọn tên khác."; return; }
    users[u] = { hash: hashPw(p), created: Date.now(), bestMCQ: 0, bestTF: 0, plays: 0 };
    setUsers(users);
    localStorage.setItem("pf_session", u);
    soundAuth(); updateAuthUI(); closeAuth();
  } else {
    if (!users[u] || users[u].hash !== hashPw(p)) { err.textContent = "Sai tên đăng nhập hoặc mật khẩu."; soundWrong(); return; }
    localStorage.setItem("pf_session", u);
    soundAuth(); updateAuthUI(); closeAuth();
  }
}
function logout() { localStorage.removeItem("pf_session"); soundClick(); updateAuthUI(); }
function saveScore(mode, score) {
  const u = currentUser(); if (!u) return null;
  const users = getUsers(); if (!users[u]) return null;
  users[u].plays = (users[u].plays || 0) + 1;
  const key = mode === "mcq" ? "bestMCQ" : "bestTF";
  if (score > (users[u][key] || 0)) users[u][key] = score;
  setUsers(users); updateAuthUI();
  return users[u][key];
}

// ---------- GRID + NAV ----------
function renderGrid() {
  elementGrid.innerHTML = "";
  ELEMENTS.forEach((el, i) => {
    const div = document.createElement("div");
    div.className = "mini-card";
    div.innerHTML = `<div class="mini-num">${el.number}</div><div class="mini-sym">${el.symbol}</div><div class="mini-name">${el.name}</div>`;
    div.addEventListener("click", () => {
      soundClick(); ripple(div, event);
      const pos = order.indexOf(i);
      current = pos === -1 ? 0 : pos;
      showStudy();
    });
    elementGrid.appendChild(div);
  });
}
function showSection(el) {
  [homeSection, studySection, quizSection].forEach(s => s.classList.add("hidden"));
  el.classList.remove("hidden");
  el.classList.remove("section-enter"); void el.offsetWidth; el.classList.add("section-enter");
}
function showStudy() { showSection(studySection); renderCard(); studySection.scrollIntoView({ behavior: "smooth" }); }
function showHome() { showSection(homeSection); window.scrollTo({ top: 0, behavior: "smooth" }); }
function showQuiz() { showSection(quizSection); startQuiz(); quizSection.scrollIntoView({ behavior: "smooth" }); }

// ---------- FLASHCARD MƯỢT ----------
function currentElement() { return ELEMENTS[order[current]]; }
function renderCard() {
  const el = currentElement();
  isFlipped = false;
  flashcard.classList.remove("flipped");
  $("cardNumberFront").textContent = el.number;
  $("cardSymbolFront").textContent = el.symbol;
  $("cardNameFront").textContent = el.name;
  $("cardNameBack").textContent = el.name;
  $("cardSymbolBack").textContent = el.symbol;
  $("infoNumber").textContent = el.number;
  $("infoMass").textContent = el.mass;
  $("infoGroup").textContent = el.group;
  $("infoPeriod").textContent = el.period;
  $("infoType").textContent = el.type;
  $("infoElectron").textContent = el.electron;
  progressText.textContent = `Nguyên tố ${current + 1} / ${ELEMENTS.length}`;
  progressFill.style.width = `${((current + 1) / ELEMENTS.length) * 100}%`;
}
function flipCard() {
  isFlipped = !isFlipped;
  flashcard.classList.toggle("flipped", isFlipped);
  soundFlip();
}
function slideTo(dir, fn) {
  flashcard.classList.remove("slide-left", "slide-right");
  void flashcard.offsetWidth;
  flashcard.classList.add(dir === 1 ? "slide-left" : "slide-right");
  fn();
}
function nextCard() { slideTo(1, () => { current = (current + 1) % order.length; renderCard(); }); soundNext(); }
function prevCard() { slideTo(-1, () => { current = (current - 1 + order.length) % order.length; renderCard(); }); soundNext(); }
function shuffleCards() {
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  current = 0; renderCard(); soundShuffle();
}

// Nghiêng thẻ 3D theo chuột (mượt, chỉ desktop)
document.addEventListener("mousemove", (e) => {
  if (studySection.classList.contains("hidden") || isFlipped) return;
  const r = flashcard.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  const dx = (e.clientX - cx) / r.width, dy = (e.clientY - cy) / r.height;
  if (Math.abs(dx) < 0.6 && Math.abs(dy) < 0.6) {
    flashcardInner.style.transform = `rotateY(${dx * 8}deg) rotateX(${-dy * 8}deg)`;
  } else flashcardInner.style.transform = "";
});
// Khi lật thì reset tilt để CSS flip chiếm quyền
const _flip = flipCard;

// ---------- RIPPLE ----------
function ripple(host, e) {
  try {
    const rect = host.getBoundingClientRect();
    const s = document.createElement("span");
    s.className = "ripple";
    const size = Math.max(rect.width, rect.height) * 2;
    s.style.width = s.style.height = size + "px";
    const x = (e && e.clientX ? e.clientX - rect.left : rect.width / 2);
    const y = (e && e.clientY ? e.clientY - rect.top : rect.height / 2);
    s.style.left = x + "px"; s.style.top = y + "px";
    host.appendChild(s); setTimeout(() => s.remove(), 600);
  } catch (err) {}
}
document.querySelectorAll(".ripple-host").forEach(b => b.addEventListener("pointerdown", (e) => ripple(b, e)));

// ---------- QUIZ 2 CHẾ ĐỘ ----------
function currentQuizList() { return quizMode === "mcq" ? QUIZ_MCQ : QUIZ_TF; }
function setQuizMode(m) {
  quizMode = m;
  $("tabMcq").classList.toggle("active", m === "mcq");
  $("tabTf").classList.toggle("active", m === "tf");
  soundClick(); startQuiz();
}
function startQuiz() {
  quizIndex = 0; quizScore = 0;
  $("quizBox").classList.remove("hidden");
  $("quizResult").classList.add("hidden");
  renderQuiz();
}
function renderQuiz() {
  const list = currentQuizList();
  const item = list[quizIndex];
  quizAnswered = false;
  $("quizCounter").textContent = `Câu ${quizIndex + 1} / ${list.length} • ${quizMode === "mcq" ? "Trắc nghiệm" : "Đúng/Sai"}`;
  $("quizProgress").style.width = `${(quizIndex / list.length) * 100}%`;
  $("quizQuestion").textContent = item.q;
  $("quizFeedback").textContent = "";
  $("quizFeedback").className = "quiz-feedback";
  $("quizNextBtn").classList.add("hidden");
  const box = $("quizAnswers");
  box.innerHTML = "";
  if (quizMode === "mcq") {
    const letters = ["A", "B", "C", "D"];
    item.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className = "quiz-opt";
      btn.textContent = `${letters[i]}. ${opt}`;
      btn.addEventListener("click", () => answerMcq(i, btn));
      box.appendChild(btn);
    });
  } else {
    const row = document.createElement("div");
    row.className = "tf-row";
    [["✅ Đúng", true, "true"], ["❌ Sai", false, "false"]].forEach(([label, val, cls]) => {
      const btn = document.createElement("button");
      btn.className = `quiz-opt tf-btn ${cls}`;
      btn.textContent = label;
      btn.addEventListener("click", () => answerTf(val, btn));
      row.appendChild(btn);
    });
    box.appendChild(row);
  }
}
function lockQuiz() { document.querySelectorAll(".quiz-opt").forEach(b => (b.disabled = true)); }
function afterAnswer(isRight, btnEl, correctLabel, explain) {
  const list = currentQuizList();
  lockQuiz();
  if (isRight) {
    btnEl.classList.add("correct"); quizScore++;
    $("quizFeedback").textContent = "✓ Chính xác!" + (explain ? " " + explain : "");
    $("quizFeedback").classList.add("ok"); soundCorrect();
  } else {
    btnEl.classList.add("wrong");
    document.querySelectorAll(".quiz-opt").forEach(b => { if (b.dataset.correct === "1") b.classList.add("correct"); });
    // fallback cho MCQ: tô đáp án đúng
    if (quizMode === "mcq") {
      const btns = document.querySelectorAll(".quiz-opt");
      const ans = currentQuizList()[quizIndex].answer;
      if (btns[ans]) btns[ans].classList.add("correct");
    }
    $("quizFeedback").textContent = `✗ Chưa chính xác! Đáp án: ${correctLabel}.` + (explain ? " " + explain : "");
    $("quizFeedback").classList.add("no"); soundWrong();
  }
  $("quizProgress").style.width = `${((quizIndex + 1) / list.length) * 100}%`;
  $("quizNextBtn").textContent = quizIndex === list.length - 1 ? "Xem kết quả →" : "Câu tiếp theo →";
  $("quizNextBtn").classList.remove("hidden");
}
function answerMcq(i, btn) {
  if (quizAnswered) return; quizAnswered = true;
  const item = currentQuizList()[quizIndex];
  afterAnswer(i === item.answer, btn, item.options[item.answer], "");
}
function answerTf(val, btn) {
  if (quizAnswered) return; quizAnswered = true;
  const item = currentQuizList()[quizIndex];
  // đánh dấu nút đúng để afterAnswer tô
  document.querySelectorAll(".quiz-opt").forEach(b => {
    const isTrueBtn = b.textContent.includes("Đúng");
    if ((item.answer && isTrueBtn) || (!item.answer && !isTrueBtn)) b.dataset.correct = "1";
  });
  afterAnswer(val === item.answer, btn, item.answer ? "Đúng" : "Sai", item.explain);
}
function nextQuiz() {
  soundClick();
  const list = currentQuizList();
  if (quizIndex < list.length - 1) { quizIndex++; renderQuiz(); }
  else showQuizResult();
}
function showQuizResult() {
  $("quizBox").classList.add("hidden");
  $("quizResult").classList.remove("hidden");
  const list = currentQuizList();
  $("quizScore").textContent = `${quizScore}/${list.length}`;
  let msg = quizScore === list.length ? "🎉 Xuất sắc! Bạn thuộc cả 5 nguyên tố!"
    : quizScore >= 4 ? "👏 Rất tốt! Ôn thêm chút nữa là hoàn hảo."
    : quizScore >= 3 ? "💪 Khá rồi! Lật lại flashcard để nhớ lâu hơn."
    : "📖 Đừng nản! Quay lại học thẻ rồi thử lại nhé.";
  $("quizMessage").textContent = `Bạn đạt ${quizScore}/${list.length} câu. ${msg}`;
  const best = saveScore(quizMode, quizScore);
  $("bestScore").textContent = currentUser()
    ? `🏆 Điểm cao nhất (${quizMode === "mcq" ? "Trắc nghiệm" : "Đúng/Sai"}) của ${currentUser()}: ${best}/5`
    : "💡 Đăng nhập để lưu điểm cao nhất trên máy này.";
  if (quizScore === list.length) soundWin();
}

// ---------- EVENTS ----------
$("startBtn").addEventListener("click", (e) => { soundClick(); ripple(e.currentTarget, e); showStudy(); });
$("homeQuizBtn").addEventListener("click", () => { soundClick(); showQuiz(); });
$("homeBtn").addEventListener("click", () => { soundClick(); showHome(); });
$("shuffleBtn").addEventListener("click", shuffleCards);
$("quizBtn").addEventListener("click", () => { soundClick(); showQuiz(); });
$("backToStudyBtn").addEventListener("click", () => { soundClick(); showStudy(); });
$("quizStudyBtn").addEventListener("click", () => { soundClick(); showStudy(); });
$("quizRetryBtn").addEventListener("click", () => { soundClick(); startQuiz(); });
$("quizNextBtn").addEventListener("click", nextQuiz);
$("tabMcq").addEventListener("click", () => setQuizMode("mcq"));
$("tabTf").addEventListener("click", () => setQuizMode("tf"));

$("prevBtn").addEventListener("click", prevCard);
$("nextBtn").addEventListener("click", nextCard);
$("flipBtn").addEventListener("click", () => { flashcardInner.style.transform = ""; flipCard(); });
flashcard.addEventListener("click", () => { flashcardInner.style.transform = ""; flipCard(); });
flashcard.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flipCard(); }
  if (e.key === "ArrowRight") nextCard();
  if (e.key === "ArrowLeft") prevCard();
});
// Vuốt trên mobile
let touchX = null;
flashcard.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
flashcard.addEventListener("touchend", (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 45) { dx < 0 ? nextCard() : prevCard(); }
  touchX = null;
}, { passive: true });

$("themeBtn").addEventListener("click", toggleTheme);
$("soundBtn").addEventListener("click", () => {
  soundOn = !soundOn;
  localStorage.setItem("pf_sound", soundOn ? "on" : "off");
  updateSoundBtn(); if (soundOn) soundClick();
});

$("authBtn").addEventListener("click", openAuth);
$("authClose").addEventListener("click", closeAuth);
$("authOverlay").addEventListener("click", (e) => { if (e.target.id === "authOverlay") closeAuth(); });
$("tabLogin").addEventListener("click", () => setAuthMode("login"));
$("tabRegister").addEventListener("click", () => setAuthMode("register"));
$("authSubmit").addEventListener("click", submitAuth);
$("authPass").addEventListener("keydown", (e) => { if (e.key === "Enter") submitAuth(); });
$("logoutBtn").addEventListener("click", logout);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAuth(); });

// ---------- INIT ----------
initTheme(); updateSoundBtn(); renderGrid(); renderCard(); updateAuthUI(); setAuthMode("login");
