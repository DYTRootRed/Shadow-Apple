Shadow Apple — JSON Memory Backend
=================================

Deploy on Replit/Glitch/Render (free). Steps (Replit example):
1) Create a new Node.js Repl.
2) Upload `json-backend/server.js` and `json-backend/package.json` to the repl.
3) Create a `json-backend/data/` folder (empty). Replit will persist files between runs.
4) Run. Copy the public URL (e.g., https://shadowapple-json.repl.co).

Back in your site:
- Open `chat_standalone_fixed.html`.
- Find the REMOTE block at the top and set:
    REMOTE.MEM_URL = "https://YOUR-REPL-URL";
- Deploy your page. Now all users share memory + accounts (stored in the JSON backend).

API:
- POST /signup { username, number, password, pfp? }
- POST /login  { username, password }  -> { username, number, pfp }
- GET  /mem?username=NAME -> { state }
- POST /mem { username, state } -> { ok:true }
