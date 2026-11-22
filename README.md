# EduSphere AI

EduSphere AI is a study workspace for Python, SQL, and machine learning. It includes nine original lessons, worked examples, interactive quizzes, bookmarks, notes, and topic progress. Study help provides explanations and walkthroughs for each lesson.

**Maintainer** Aman Dutt Mathur ([@Amanduttmathur](https://github.com/Amanduttmathur))

## Run locally

Install Node.js 24 or later and run `npm start` from the repository root. Open [localhost:8000](http://localhost:8000). The app creates a SQLite database on first run and requires no npm dependencies.

Create an account to sync bookmarks, notes, and quiz progress across browsers. Guest and account progress are stored separately. When multiple browsers edit the same note, the last successful save takes precedence.

## Configure AI tutoring

Set `OPENAI_API_KEY` and `OPENAI_MODEL` in the server environment, then restart the server. The tutor is available to signed-in users. It sends the selected lesson and the current question to OpenAI. Each question is independent. Keep the API key in server configuration.

## Deploy

Run the Node server with HTTPS at the hosting layer, `NODE_ENV=production` for secure cookies, `HOST=0.0.0.0` if the platform routes requests over the container network, and the platform-provided `PORT`. Set `DATABASE_PATH` to a file on persistent writable storage and include it in your backups. Public registration is enabled. Use the hosting platform's traffic controls and provider budget settings for public deployments.

To host only the browser-based guest mode, serve `index.html` and `app.js` with a static host. GitHub Pages supports this mode.

## Add lessons

Add a lesson to a topic in `app.js` with a unique lowercase ID made of letters and hyphens, an explanation, an example, a walkthrough, a quiz question, choices, and a zero-based answer index. Keep the ID stable because it identifies saved study data.
