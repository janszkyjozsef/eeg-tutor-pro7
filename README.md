# EEG Tutor – Pro v2.1

Multi-file version of your EEG Tutor with:
- Many more EEG patterns (benign, artifacts, epileptiform, rhythmic/periodic).
- HU/EN toggle (remembers your choice).
- **Advanced** mode toggle: extra pro-level notes and tips.
- Lessons: **40+ total** (10 Beginner, 10 Intermediate, 10 Expert) with mini-quizzes.
- Quiz requires **Freeze** before marking; marking while running is blocked with a banner.
- Wider hit window in the quiz for easier targeting.
- Explore/Identify never show your manual circles; only the Quiz view can display them.
- Simple XP/streak/medals stored locally (no login).

## Files
- `index.html` – UI layout and script includes
- `styles.css` – Styling (dark theme)
- `js/i18n.js` – Language texts + helpers
- `js/data.cases.js` – Synthetic EEG generators and CASES list
- `js/data.lessons.js` – 30 lessons
- `js/app.js` – App logic

## How to run
Open `index.html` locally or host on GitHub Pages. Everything is self-contained; no build step.

## Notes
- Data are **synthetic** for training purposes.
- Footer lists upcoming ideas: EDF/CSV import, JSON export, channel-aware scoring.


## Optional Firebase login
- Enable Google Sign-In in Firebase Auth.
- Add your GitHub Pages domain under **Authorized domains** in Firebase Auth settings.
- Update `auth.js` with your Firebase config if needed.
- If login fails, the app runs offline and stores progress locally.
