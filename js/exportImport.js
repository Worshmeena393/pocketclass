// ---------------------------
// Pocket Classroom - exportImport.js
// ---------------------------
import { loadCapsule, saveCapsule, loadIndex, saveIndex, genId } from "./storage.js";

// -------- EXPORT CAPSULE --------
export function exportCapsule(id) {
  const capsule = loadCapsule(id);
  if (!capsule) return alert("❌ Capsule not found!");

  capsule.schema = capsule.schema || "pocket-classroom/v1";

  const blob = new Blob([JSON.stringify(capsule, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${slugify(capsule.title)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  alert("✅ Capsule exported!");
}

// -------- IMPORT CAPSULE --------
export function importCapsule(file) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error("❌ No file selected"));

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        // --- VALIDATION ---
        if (!data.title || typeof data.title !== "string") {
          throw new Error("Invalid or missing title");
        }
        if (data.schema && data.schema !== "pocket-classroom/v1") {
          throw new Error("Unsupported capsule schema");
        }

        // --- ASSIGN DEFAULTS ---
        data.id = data.id || genId();
        data.schema = "pocket-classroom/v1";
        data.createdAt = data.createdAt || new Date().toISOString();
        data.updatedAt = new Date().toISOString();

        data.notes = Array.isArray(data.notes) ? data.notes : [];
        data.flashcards = Array.isArray(data.flashcards) ? data.flashcards : [];
        data.quiz = Array.isArray(data.quiz) ? data.quiz : [];
        data.resources = Array.isArray(data.resources) ? data.resources : [];

        data.subject = data.subject || "general";
        data.level = data.level || "Beginner";

        // --- SAVE CAPSULE ---
        saveCapsule(data);

        // --- UPDATE INDEX ---
        const idx = loadIndex();
        if (!idx.find(c => c.id === data.id)) {
          idx.push({
            id: data.id,
            title: data.title,
            subject: data.subject,
            level: data.level,
            updatedAt: data.updatedAt,
          });
          saveIndex(idx);
        }

        // --- DISPATCH EVENT ---
        document.dispatchEvent(new CustomEvent("capsule:imported", { detail: { id: data.id } }));

        resolve(data.id);
      } catch (err) {
        reject(new Error("❌ Failed to import: " + err.message));
      }
    };

    reader.onerror = () => reject(new Error("❌ Failed to read file"));
    reader.readAsText(file);
  });
}

// -------- HELPER --------
function slugify(str) {
  return str
    .toString()
    .normalize("NFD")                     // normalize accents
    .replace(/[\u0300-\u036f]/g, "")      // remove accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")          // replace invalid chars
    .replace(/(^-|-$)+/g, "") || "capsule";
}
