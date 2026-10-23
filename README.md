# CareTrack

Frontend-only quarantine facility management app (74 beds). No build step, no dependencies, no backend.
Data is stored in the browser's `localStorage` (key `caretrack.v1`).

## Run in VS Code
1. Open this folder in VS Code.
2. Install the **Live Server** extension, right-click `index.html`, choose **Open with Live Server**.
   (Or run `npx serve .` / `python3 -m http.server 8000` in this folder.)

## Structure
- `index.html`  page shell
- `css/styles.css`  theme (light/dark), responsive layout, mobile card tables
- `js/app.js`  data seeding, business rules, views, role permissions

## Roles
- **Nurse**: record temperatures
- **Doctor**: log visits, approve discharge (only if eligible), record death
- **Admin**: admit, move beds, discharge approved patients, delete duplicate readings

## Key rules (js/app.js)
- `CAP = 74` capacity, `FEV = 37.5` fever threshold, `BENCH = 85` survival benchmark
- `elig(p)`: needs 3 full prior days, each with a reading, all below 37.5, and no fever today
- `flags(p)`: missing days and duplicate same-day readings
- Admin discharge needs doctor approval and is re-checked at discharge time

## Reset data
Use **Reset demo data** in the header, or clear `caretrack.v1` in DevTools, Application, Local Storage.

## Deploying later
It is a static site: deploy the folder as-is to Vercel, Netlify or GitHub Pages (no build command, output directory `.`).
