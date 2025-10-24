📘 Pocket Classroom

Offline Learning SPA — Notes, Flashcards & Quiz Capsules

Project Overview

Pocket Classroom is a single-page web application (SPA) for creating, learning, and sharing mini learning "capsules" offline. Each capsule can contain:

Notes (multi-line)

Flashcards (front/back with flip animation)

Quizzes (multiple-choice with scoring)

Capsules are saved in LocalStorage and can be exported/imported as JSON files. The app works entirely offline and requires no backend.

Tech Stack

Frontend: HTML5, CSS3, Bootstrap 5

JavaScript: Vanilla JS with ES Modules

Persistence: LocalStorage

Optional: Sounds for flashcards (flip.mp3)

Features
Library (Home)

View all saved capsules in a card grid

Shows: title, subject, level, updated time, quiz best score, known flashcards count

Actions per capsule: Learn, Edit, Export, Delete

Top actions: New Capsule, Import JSON

Author Mode

Form fields: Title, Subject, Level, Description

Notes editor: multi-line input (one note per line)

Flashcards editor: add/remove flashcards dynamically

Quiz editor: add/remove multiple-choice questions (A-D)

Auto-save during editing; manual Save persists the capsule

Validations: title required; at least one of notes/flashcards/quiz must exist

Learn Mode

Dropdown to select a capsule

Three tabs: Notes, Flashcards, Quiz

Notes: searchable list

Flashcards: flip animation, Prev/Next, mark Known/Unknown, progress saved

Quiz: sequential questions, instant feedback, best score stored per capsule

Export / Import

Export capsule as JSON

Import valid JSON files with schema validation (pocket-classroom/v1)

Avoids ID collisions when importing

Setup & Usage

Open the project

Use VS Code Live Server or any local server to open index.html

ES modules require http:// access; file:// may not work

Library (Home)

Create a new capsule or import JSON

Edit, delete, or learn from capsules

Author Mode

Fill out title, subject, and level

Add notes, flashcards, and quiz questions

Save to persist changes

Learn Mode

Select a capsule from the dropdown

Explore Notes, Flashcards, and Quiz

Track progress (Known flashcards & best quiz score)

File Structure
/(pocket-classroom-root)
│
├─ index.html           # SPA entry point
│
├─ /css
│  └─ style.css         # Custom styles
│
├─ /js
│  ├─ main.js           # App initialization & routing
│  ├─ storage.js        # LocalStorage helpers
│  ├─ library.js        # Library view rendering
│  ├─ author.js         # Author mode logic
│  ├─ learn.js          # Learn mode logic
│  ├─ exportImport.js   # Export/Import JSON helpers
│
├─ /sounds
│  └─ flip.mp3          # Optional flashcard flip sound
│
├─ /assets              # Optional images/icons
│
└─ README.md            # Project documentation

Single-Page App Behavior

Library, Author, and Learn views are all in one HTML page

Views are toggled via JavaScript, no page reloads

State and progress are maintained using LocalStorage

Keyboard Shortcuts (Optional)

Space: Flip flashcard

[/]: Cycle through Notes, Flashcards, Quiz tabs

Export / Import Notes

JSON schema: "pocket-classroom/v1"

Imported capsules automatically receive a new unique ID if conflicts exist

Prevents data loss when merging multiple imports

Submission Checklist

Upload the project folder or ZIP

Include one exported sample capsule JSON

Include a short demo video (1-2 min) showing:

Creating a capsule

Learning a capsule

Exporting and importing

Optional: Deploy live on GitHub Pages and add the link in README

Suggested Live Demo Link:
https://worshmeena393.github.io/pocketclass/