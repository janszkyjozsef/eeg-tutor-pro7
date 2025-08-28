# EEG Tutor – Pro v2.1

Multi-file version of your EEG Tutor with:
- Many more EEG patterns (benign, artifacts, epileptiform, rhythmic/periodic).
- HU/US toggle (remembers your choice).
- **Advanced** mode toggle: extra pro-level notes and tips.
- Lessons: **40+ total** (10 Beginner, 10 Intermediate, 10 Expert) with mini-quizzes.
- Quiz requires **Freeze** before marking; marking while running is blocked with a banner.
- Wider hit window in the quiz for easier targeting.
- Explore/Identify never show your manual circles; only the Quiz view can display them.
- Simple XP/streak/medals stored locally (no login).
- **Book** section with bilingual basics and Advanced/layman switchable text.
- Language changes refresh all select menus and metadata automatically.
- Changing Identify difficulty loads a new case instantly and your chosen level stays selected after switching languages.

## Files
- `index.html` – UI layout and script includes
- `styles.css` – Styling (dark theme)
- `i18n.js` – Language texts + helpers
- `data.cases.js` – Synthetic EEG generators and CASES list
- `data.lessons.js` – 30 lessons
- `data.book.js` – Basic EEG book pages
- `app.js` – App logic
- `package.json` – Project metadata and test scripts

## How to run
Open `index.html` locally or host on GitHub Pages. Everything is self-contained; no build step.

## Development
Run `npm test` to check all JavaScript files for syntax errors.

## Notes
- Data are **synthetic** for training purposes.
- Footer lists upcoming ideas: EDF/CSV import, JSON export, channel-aware scoring.


## Optional Firebase login
- Enable Google Sign-In in Firebase Auth.
- Add your GitHub Pages domain under **Authorized domains** in Firebase Auth settings.
- Update `auth.js` with your Firebase config if needed.
- If login fails or the domain isn't authorized, the button is disabled and the app runs offline with progress stored locally.

