// ---------------------------
// Pocket Classroom - storage.js
// ---------------------------

// 🔑 Key helpers
export const IDX_KEY = 'pc_capsules_index';
export const CAP_KEY = id => `pc_capsule_${id}`;
export const PROG_KEY = id => `pc_progress_${id}`;

// ✅ Safe JSON parse
function safeParse(json, fallback) {
  try {
    return JSON.parse(json) ?? fallback;
  } catch {
    return fallback;
  }
}

// ---------------------------
// INDEX: List of all capsules
// ---------------------------
export function loadIndex() {
  return safeParse(localStorage.getItem(IDX_KEY), []);
}

export function saveIndex(indexArr) {
  localStorage.setItem(IDX_KEY, JSON.stringify(indexArr));
}

// ---------------------------
// CAPSULES: Full capsule data
// ---------------------------
export function loadCapsule(id) {
  return safeParse(localStorage.getItem(CAP_KEY(id)), null);
}

export function saveCapsule(cap) {
  if (!cap.id) cap.id = genId();           // auto-generate ID if missing
  cap.updatedAt = new Date().toISOString(); // always update timestamp
  localStorage.setItem(CAP_KEY(cap.id), JSON.stringify(cap));

  // Ensure index contains this capsule
  const idx = loadIndex();
  const existingIndex = idx.find(c => c.id === cap.id);
  if (existingIndex) {
    existingIndex.title = cap.title;          // update title in index
    existingIndex.updatedAt = cap.updatedAt;  // update timestamp
  } else {
    idx.push({ id: cap.id, title: cap.title, updatedAt: cap.updatedAt });
  }
  saveIndex(idx);
}

// Delete a capsule completely
export function deleteCapsule(id) {
  localStorage.removeItem(CAP_KEY(id));
  localStorage.removeItem(PROG_KEY(id));

  const idx = loadIndex().filter(c => c.id !== id);
  saveIndex(idx);
}

// ---------------------------
// PROGRESS: Learn tracking
// ---------------------------
export function loadProgress(id) {
  return safeParse(localStorage.getItem(PROG_KEY(id)), {});
}

export function saveProgress(id, progObj) {
  localStorage.setItem(PROG_KEY(id), JSON.stringify(progObj));
}

// ---------------------------
// UTILITIES
// ---------------------------

// Generate unique ID
export function genId() {
  return `cap_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

// Human-readable "time ago"
export function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// Clear all app data (optional utility)
export function clearAllData() {
  if (confirm("⚠️ Clear all Pocket Classroom data? This cannot be undone.")) {
    localStorage.clear();
    alert("All data cleared!");
  }
}

// ---------------------------
// IMPORT / EXPORT CAPSULE
// ---------------------------
export function exportCapsule(id) {
  const cap = loadCapsule(id);
  if (!cap) return null;
  return JSON.stringify(cap, null, 2);
}

export function importCapsule(jsonStr) {
  try {
    const cap = JSON.parse(jsonStr);
    if (!cap.id) cap.id = genId();
    saveCapsule(cap);
    return cap.id;
  } catch (err) {
    console.error("Invalid capsule JSON:", err);
    return null;
  }
}
