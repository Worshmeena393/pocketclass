// ---------------------------
// Pocket Classroom - author.js
// ---------------------------
import { loadCapsule, saveCapsule } from "./storage.js";

// ---------------------------
// ELEMENTS
// ---------------------------
const authorForm = document.getElementById("authorForm");
const capTitle = document.getElementById("capTitle");
const capSubject = document.getElementById("capSubject");
const capLevel = document.getElementById("capLevel");
const capDesc = document.getElementById("capDesc");
const notesEditor = document.getElementById("notesEditor");

const flashcardsEditor = document.getElementById("flashcardsEditor");
const btnAddFlash = document.getElementById("btnAddFlash");

const quizEditor = document.getElementById("quizEditor");
const btnAddQuiz = document.getElementById("btnAddQuiz");

const saveBtn = document.getElementById("saveCapsuleBtn");
const btnBack = document.getElementById("btnBack");

// ---------------------------
// STATE
// ---------------------------
let currentCapsule = null;
let notes = [];
let flashcards = [];
let quiz = [];

// ---------------------------
// RENDER CAPSULE FOR EDIT
// ---------------------------
export function renderAuthor(id = null) {
  if (!id) {
    // New Capsule
    currentCapsule = { title: "", subject: "", level: "Beginner", desc: "", notes: [], flashcards: [], quiz: [] };
  } else {
    const cap = loadCapsule(id);
    if (!cap) return alert("Capsule not found!");
    currentCapsule = cap;
  }

  // Fill inputs
  capTitle.value = currentCapsule.title || "";
  capSubject.value = currentCapsule.subject || "";
  capLevel.value = currentCapsule.level || "Beginner";
  capDesc.value = currentCapsule.desc || "";

  notes = currentCapsule.notes || [];
  flashcards = currentCapsule.flashcards || [];
  quiz = currentCapsule.quiz || [];

  renderNotesEditor();
  renderFlashcardsEditor();
  renderQuizEditor();
}

// ---------------------------
// NOTES
// ---------------------------
function renderNotesEditor() {
  notesEditor.value = notes.join("\n");
}

// ---------------------------
// FLASHCARDS
// ---------------------------
function renderFlashcardsEditor() {
  flashcardsEditor.innerHTML = "";
  flashcards.forEach((f, i) => {
    const div = document.createElement("div");
    div.className = "mb-2 p-2 flashcard-item bg-dark rounded shadow-sm";

    div.innerHTML = `
      <input type="text" class="form-control mb-1 flash-front" placeholder="Front" value="${f.front || ""}">
      <input type="text" class="form-control mb-1 flash-back" placeholder="Back" value="${f.back || ""}">
      <button type="button" class="btn btn-sm btn-danger remove-flash">Remove</button>
      <hr class="bg-secondary">
    `;

    div.querySelector(".remove-flash").onclick = () => {
      flashcards.splice(i, 1);
      renderFlashcardsEditor();
    };

    div.querySelector(".flash-front").oninput = (e) => { flashcards[i].front = e.target.value; };
    div.querySelector(".flash-back").oninput = (e) => { flashcards[i].back = e.target.value; };

    flashcardsEditor.appendChild(div);
  });
}

btnAddFlash.onclick = () => {
  flashcards.push({ front: "", back: "" });
  renderFlashcardsEditor();
};

// ---------------------------
// QUIZ
// ---------------------------
function renderQuizEditor() {
  quizEditor.innerHTML = "";
  quiz.forEach((q, i) => {
    const div = document.createElement("div");
    div.className = "quiz-item";

    div.innerHTML = `
      <input type="text" class="quiz-q form-control mb-1" placeholder="Question" value="${q.question || ""}">
      <input type="text" class="quiz-opt form-control mb-1" placeholder="Option 1" value="${q.options?.[0] || ""}">
      <input type="text" class="quiz-opt form-control mb-1" placeholder="Option 2" value="${q.options?.[1] || ""}">
      <input type="text" class="quiz-opt form-control mb-1" placeholder="Option 3" value="${q.options?.[2] || ""}">
      <input type="text" class="quiz-opt form-control mb-1" placeholder="Option 4" value="${q.options?.[3] || ""}">
      <input type="number" class="quiz-ans form-control mb-1" placeholder="Correct Option (0-3)" value="${q.answerIndex ?? 0}">
      <button type="button" class="btn btn-sm btn-danger remove-quiz">Remove Question</button>
      <hr class="bg-secondary">
    `;

    // Remove question
    div.querySelector(".remove-quiz").onclick = () => {
      quiz.splice(i, 1);
      renderQuizEditor();
    };

    // Update question values
    div.querySelector(".quiz-q").oninput = (e) => { quiz[i].question = e.target.value; };
    const opts = div.querySelectorAll(".quiz-opt");
    opts.forEach((optInput, j) => {
      optInput.oninput = (e) => {
        quiz[i].options = quiz[i].options || ["", "", "", ""];
        quiz[i].options[j] = e.target.value;
      };
    });
    div.querySelector(".quiz-ans").oninput = (e) => { quiz[i].answerIndex = parseInt(e.target.value) || 0; };

    quizEditor.appendChild(div);
  });
}

btnAddQuiz.onclick = () => {
  quiz.push({ question: "", options: ["", "", "", ""], answerIndex: 0 });
  renderQuizEditor();
};

// ---------------------------
// FORM SUBMIT
// ---------------------------
authorForm.onsubmit = (e) => {
  e.preventDefault();

  currentCapsule.title = capTitle.value.trim();
  currentCapsule.subject = capSubject.value.trim();
  currentCapsule.level = capLevel.value;
  currentCapsule.desc = capDesc.value.trim();
  currentCapsule.notes = notesEditor.value.split("\n").map(n => n.trim()).filter(Boolean);
  currentCapsule.flashcards = flashcards;
  currentCapsule.quiz = quiz;

  saveCapsule(currentCapsule);
  alert("✅ Capsule saved!");
};

// ---------------------------
// BACK BUTTON
// ---------------------------
btnBack.onclick = () => {
  window.history.back(); // or call your main.js show('library')
};
