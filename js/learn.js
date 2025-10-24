// ---------------------------
// Pocket Classroom - learn.js
// ---------------------------
import { loadIndex, loadCapsule, loadProgress, saveProgress } from "./storage.js";

const capsuleSelect = document.getElementById("learnSelect");
const notesTabBtn = document.querySelector('#learnTabs a[data-tab="notes"]');
const flashTabBtn = document.querySelector('#learnTabs a[data-tab="flashcards"]');
const quizTabBtn = document.querySelector('#learnTabs a[data-tab="quiz"]');

const notesListContainer = document.getElementById("notesList");
const flashcardContainer = document.getElementById("flashcard");
const flashStatus = document.getElementById("flashStatus");
const quizBox = document.getElementById("quizBox");

let currentId = null, capsule = null, progress = {};
let flashIndex = 0, known = new Set();
let qIndex = 0, correct = 0;
let flipped = false;

// flip sound
const flipSound = new Audio("sounds/flip.mp3"); // make sure /sounds/flip.mp3 exists


// --------------- helpers ----------------
function ensureCapsuleArrays(c) {
  c.notes = c.notes || [];
  c.flashcards = c.flashcards || [];
  c.quiz = c.quiz || [];
}

function createTextDiv(className, text) {
  const d = document.createElement("div");
  d.className = className;
  d.textContent = text ?? "";
  return d;
}

// ---------------- RENDER LEARN ----------------
export function renderLearn(id = null) {
  capsuleSelect.innerHTML = "";
  const index = loadIndex();
  if (!index || index.length === 0) {
    capsuleSelect.disabled = true;
    flashcardContainer.innerHTML = "<div class='text-muted'>No capsules available.</div>";
    return;
  }
  capsuleSelect.disabled = false;

  index.forEach(cap => {
    const opt = document.createElement("option");
    opt.value = cap.id;
    opt.textContent = cap.title;
    capsuleSelect.appendChild(opt);
  });

  capsuleSelect.onchange = () => openCapsule(capsuleSelect.value);
  openCapsule(id || index[0].id);
}

// ---------------- OPEN CAPSULE ----------------
function openCapsule(id) {
  currentId = id;
  capsule = loadCapsule(id);
  if (!capsule) {
    flashcardContainer.innerHTML = "<div class='text-danger'>Error loading capsule.</div>";
    return;
  }

  ensureCapsuleArrays(capsule);

  progress = loadProgress(id) || {};
  flashIndex = 0;
  known = new Set(progress.knownFlashcards || []);
  qIndex = 0;
  correct = 0;
  flipped = false;

  showNotes();
}

// ---------------- TABS ----------------
function activateTab(tab) {
  document.querySelectorAll("#learnView .tab-pane").forEach(p => p.classList.remove("show", "active"));
  notesTabBtn.classList.remove("active");
  flashTabBtn.classList.remove("active");
  quizTabBtn.classList.remove("active");

  if (tab === "notes") {
    notesTabBtn.classList.add("active");
    document.getElementById("tab-notes").classList.add("show", "active");
  } else if (tab === "flashcards") {
    flashTabBtn.classList.add("active");
    document.getElementById("tab-flashcards").classList.add("show", "active");
  } else if (tab === "quiz") {
    quizTabBtn.classList.add("active");
    document.getElementById("tab-quiz").classList.add("show", "active");
  }
}

notesTabBtn.onclick = () => { activateTab("notes"); showNotes(); };
flashTabBtn.onclick = () => { activateTab("flashcards"); showFlashcards(); };
quizTabBtn.onclick = () => { activateTab("quiz"); showQuiz(); };

// ---------------- NOTES ----------------
function showNotes() {
  const renderNotes = filter => {
    notesListContainer.innerHTML = "";
    (capsule.notes || []).filter(n => n.toLowerCase().includes((filter||"").toLowerCase()))
      .forEach(n => {
        const li = document.createElement("li");
        li.className = "list-group-item";
        li.textContent = n;
        notesListContainer.appendChild(li);
      });
  };
  renderNotes();
  const searchInput = document.getElementById("noteSearch");
  if (searchInput) searchInput.oninput = e => renderNotes(e.target.value);
  activateTab("notes");
}

// ---------------- FLASHCARDS ----------------
function showFlashcards() {
  if (!capsule.flashcards || capsule.flashcards.length === 0) {
    flashcardContainer.innerHTML = "<div class='text-warning'>No flashcards in this capsule.</div>";
    flashStatus.textContent = "";
    return;
  }

  let renderCard = () => {
    const card = capsule.flashcards[flashIndex];
    if (!card) return;

    flashcardContainer.innerHTML = "";

    // Create inner container
    const inner = document.createElement("div");
    inner.className = "flashcard-inner";
    inner.classList.add(known.has(flashIndex) ? "known" : "unknown");
    if (flipped) inner.classList.add("flipped");

    // FRONT
    const front = document.createElement("div");
    front.className = "flashcard-front";
    front.textContent = card.front || "Front side empty";

    // BACK
    const back = document.createElement("div");
    back.className = "flashcard-back";
    back.textContent = card.back || "Back side empty";

    inner.appendChild(front);
    inner.appendChild(back);

    // Flip on click
    inner.addEventListener("click", () => {
      flipped = !flipped;
      inner.classList.toggle("flipped", flipped);
      flipSound.currentTime = 0;
      flipSound.play();
    });

    flashcardContainer.appendChild(inner);
    updateFlashStatus();
  };

  const prevCard = () => { flashIndex = (flashIndex - 1 + capsule.flashcards.length) % capsule.flashcards.length; flipped = false; renderCard(); };
  const nextCard = () => { flashIndex = (flashIndex + 1) % capsule.flashcards.length; flipped = false; renderCard(); };
  const flipCard = () => {
    flipped = !flipped;
    const inner = flashcardContainer.querySelector(".flashcard-inner");
    if (inner) inner.classList.toggle("flipped", flipped);
    flipSound.currentTime = 0;
    flipSound.play();
  };
  const markKnown = () => { known.add(flashIndex); saveFlashProgress(); updateCardClass(); };
  const markUnknown = () => { known.delete(flashIndex); saveFlashProgress(); updateCardClass(); };

  const saveFlashProgress = () => { progress.knownFlashcards = [...known]; saveProgress(currentId, progress); };
  const updateCardClass = () => {
    const inner = flashcardContainer.querySelector(".flashcard-inner");
    if (inner) {
      inner.classList.toggle("known", known.has(flashIndex));
      inner.classList.toggle("unknown", !known.has(flashIndex));
    }
    updateFlashStatus();
  };
  const updateFlashStatus = () => {
    flashStatus.textContent = `Card ${flashIndex + 1}/${capsule.flashcards.length} | Known: ${known.size}`;
  };

  // wire buttons
  document.getElementById("prevCard").onclick = prevCard;
  document.getElementById("nextCard").onclick = nextCard;
  document.getElementById("flipCard").onclick = flipCard;
  document.getElementById("markKnown").onclick = markKnown;
  document.getElementById("markUnknown").onclick = markUnknown;

  renderCard();
  activateTab("flashcards");
}


    

 

// ---------------- QUIZ ----------------
function showQuiz() {
  if (!capsule.quiz || capsule.quiz.length === 0) {
    quizBox.innerHTML = "<div class='text-warning'>No quiz questions available.</div>";
    return;
  }

  qIndex = 0;
  correct = 0;

  const renderQuestion = () => {
    const q = capsule.quiz[qIndex];
    if(!q){
      const score = Math.round((correct / capsule.quiz.length)*100);
      progress.bestScore = Math.max(progress.bestScore||0, score);
      saveProgress(currentId, progress);
      quizBox.innerHTML = `<div class="alert alert-info">Quiz finished! Score: <b>${score}%</b><br>Best: <b>${progress.bestScore}%</b></div>`;
      return;
    }

    quizBox.innerHTML = "";
    const qP = document.createElement("p");
    qP.innerHTML = `<b>Q${qIndex+1}:</b> `;
    const qText = document.createElement("span");
    qText.textContent = q.question ?? "";
    qP.appendChild(qText);
    quizBox.appendChild(qP);

    const list = document.createElement("div");
    list.className = "list-group";

    const opts = q.options || q.choices || [];
    opts.forEach((opt,i)=>{
      const btn = document.createElement("button");
      btn.className="list-group-item list-group-item-action quiz-opt";
      btn.dataset.i=i;
      btn.textContent=opt;
      list.appendChild(btn);
    });

    quizBox.appendChild(list);
    const feedback = document.createElement("p");
    feedback.id="quiz-feedback";
    feedback.className="mt-2";
    quizBox.appendChild(feedback);

    if(q.explain){
      const small = document.createElement("small");
      small.className="text-muted";
      small.textContent=q.explain;
      quizBox.appendChild(small);
    }

    quizBox.querySelectorAll(".quiz-opt").forEach(btn=>{
      btn.onclick=()=>{
        const chosen=parseInt(btn.dataset.i,10);
        const correctIndex= (typeof q.answer==="number")? q.answer : (q.answerIndex??0);

        if(chosen===correctIndex){
          btn.classList.add("list-group-item-success");
          feedback.textContent="✅ Correct!";
          correct++;
        } else {
          btn.classList.add("list-group-item-danger");
          feedback.textContent=`❌ Incorrect! (Correct: ${opts[correctIndex]??correctIndex})`;
        }

        quizBox.querySelectorAll(".quiz-opt").forEach(b=>b.disabled=true);

        setTimeout(()=>{
          qIndex++;
          renderQuestion();
        },800);
      };
    });
  };

  renderQuestion();
  activateTab("quiz");
}
