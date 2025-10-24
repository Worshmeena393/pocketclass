// ---------------------------
// Pocket Classroom - library.js
// ---------------------------
import { loadIndex, loadCapsule, deleteCapsule, timeAgo } from "./storage.js";

// Grab container
const grid = document.getElementById("capsuleGrid");

// ---------------------------
// RENDER LIBRARY
// ---------------------------
export function renderLibrary() {
  const index = loadIndex();
  grid.innerHTML = "";

  // If no capsules exist — show friendly message
  if (!index.length) {
  grid.innerHTML = `
    <div class="text-center mt-5">
      <p id="noCapsuleMessage">
        No capsules yet. Click <strong>"New Capsule"</strong> to start!
      </p>
    </div>
  `;
  return;
}


  // Otherwise render each capsule card
  index.forEach(cap => {
    const capHtml = `
      <div class="col-sm-6 col-md-4 col-lg-3">
        <div class="card h-100 shadow-sm">
          <div class="card-body d-flex flex-column justify-content-between">
            <div>
              <h5 class="card-title"></h5>
              <p class="card-text small text-muted">${timeAgo(cap.updatedAt)}</p>
            </div>
            <div>
              <button class="btn btn-success btn-sm w-100 mb-2 learn-btn" data-id="${cap.id}">📘 Learn</button>
              <button class="btn btn-secondary btn-sm w-100 mb-2 edit-btn" data-id="${cap.id}">✏️ Edit</button>
              <button class="btn btn-outline-info btn-sm w-100 mb-2 export-btn" data-id="${cap.id}">💾 Export</button>
              <button class="btn btn-outline-danger btn-sm w-100 mb-2 delete-btn" data-id="${cap.id}">🗑️ Delete</button>
            </div>
          </div>
        </div>
      </div>
    `;
    grid.insertAdjacentHTML("beforeend", capHtml);

    // Safely set capsule title
    const lastCard = grid.lastElementChild;
    lastCard.querySelector(".card-title").textContent = cap.title;
  });

  attachEventListeners();
}

// ---------------------------
// BUTTON HANDLERS
// ---------------------------
function attachEventListeners() {
  // Prevent duplicate listeners
  grid.querySelectorAll("button").forEach(btn => {
    btn.replaceWith(btn.cloneNode(true));
  });

  // Learn button
  grid.querySelectorAll(".learn-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const cap = loadCapsule(btn.dataset.id);
      if (cap) document.dispatchEvent(new CustomEvent("library:learn", { detail: { id: cap.id } }));
    });
  });

  // Edit button
  grid.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const cap = loadCapsule(btn.dataset.id);
      if (cap) document.dispatchEvent(new CustomEvent("library:edit", { detail: { id: cap.id } }));
    });
  });

  // Delete button
  grid.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      if (confirm("🗑️ Are you sure you want to delete this capsule?")) {
        deleteCapsule(id);
        renderLibrary(); // Refresh list
      }
    });
  });

  // Export button
  grid.querySelectorAll(".export-btn").forEach(btn => {
    btn.addEventListener("click", () => exportCapsule(btn.dataset.id));
  });
}

// ---------------------------
// EXPORT CAPSULE AS JSON
// ---------------------------
export function exportCapsule(id) {
  const cap = loadCapsule(id);
  if (!cap) return alert("❌ Capsule not found!");

  const blob = new Blob([JSON.stringify(cap, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${cap.title.replace(/\s+/g, "_")}.json`;

  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}
