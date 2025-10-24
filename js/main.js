// ---------------------------
// Pocket Classroom - main.js
// ---------------------------

// Import modules
import { renderLibrary } from './library.js';
import { renderAuthor } from './author.js';
import { renderLearn } from './learn.js';
import { loadIndex, saveIndex, saveCapsule, genId } from './storage.js';
import { importCapsule, exportCapsule } from './exportImport.js';

// ---------------------------
// VIEW ELEMENTS
// ---------------------------
const libraryView = document.getElementById('libraryView');
const authorView  = document.getElementById('authorView');
const learnView   = document.getElementById('learnView');

const navLinks    = document.querySelectorAll('.navbar-nav .nav-link');
const btnNew      = document.getElementById('btnNew');
const importFile  = document.getElementById('importFile');

// ---------------------------
// SHOW VIEW FUNCTION
// ---------------------------
function show(view, payload = null) {
  // Hide all views
  [libraryView, authorView, learnView].forEach(v => {
    v.classList.add('d-none');
    v.setAttribute('aria-hidden', 'true');
  });

  // Show selected view
  if (view === 'library') {
    libraryView.classList.remove('d-none');
    libraryView.setAttribute('aria-hidden', 'false');
    renderLibrary();
  } else if (view === 'author') {
    authorView.classList.remove('d-none');
    authorView.setAttribute('aria-hidden', 'false');
    renderAuthor(payload);
  } else if (view === 'learn') {
    learnView.classList.remove('d-none');
    learnView.setAttribute('aria-hidden', 'false');
    renderLearn(payload);
  }

  // Update navbar active class
  navLinks.forEach(a => a.classList.remove('active'));
  document.querySelector(`.nav-link[data-view="${view}"]`)?.classList.add('active');
}

// ---------------------------
// NAVBAR EVENTS
// ---------------------------
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const view = link.getAttribute('data-view');
    show(view);
  });
});

// ---------------------------
// NEW CAPSULE BUTTON
// ---------------------------
btnNew.addEventListener('click', () => {
  show('author'); // open empty capsule
  renderAuthor();
});

// ---------------------------
// IMPORT CAPSULE
// ---------------------------
importFile.addEventListener('change', async (ev) => {
  const file = ev.target.files?.[0];
  if (!file) return;

  try {
    await importCapsule(file); // importCapsule handles saving & index
    alert('✅ Capsule imported!');
    show('library');
  } catch (err) {
    alert('❌ Import failed: ' + err.message);
  }

  ev.target.value = ''; // reset file input
});

// ---------------------------
// CUSTOM EVENTS FROM LIBRARY
// ---------------------------
document.addEventListener('library:edit', e => {
  const id = e.detail.id;
  show('author', id);
});

document.addEventListener('library:learn', e => {
  const id = e.detail.id;
  show('learn', id);
});

// ---------------------------
// INITIAL LOAD
// ---------------------------
show('library');
