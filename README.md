# EduSphere AI

EduSphere AI is a study workspace covering Python, SQL, Machine Learning, Statistics, Pandas, NumPy, Data Visualization, and Model Evaluation. It includes 24 original lessons, worked examples, interactive quizzes, bookmarks, notes, and topic progress. Study help provides explanations and walkthroughs for each lesson.

**Maintainer** Aman Dutt Mathur ([@Amanduttmathur](https://github.com/Amanduttmathur))

## Run locally

Install Node.js 24.10 or later and run `npm start` from the repository root. Open [localhost:8000](http://localhost:8000). The app creates a SQLite database on first run and requires no npm dependencies.

Create an account to sync bookmarks, notes, and quiz progress across browsers. Guest and account progress are stored separately. When multiple browsers edit the same note, the last successful save takes precedence.

## Find a topic

Use **Find a topic** in the Study tab to filter the catalog by topic name or lesson title. Select a matching topic to study it.

## Learn any topic

Open **My Topics** and sign in to generate a three-lesson beginner path with examples and quizzes. Generated paths are saved to your account. Generation uses the configured OpenAI model and requires Structured Outputs support. The topic name is sent to OpenAI. Saved paths can be reopened without generating them again.

## SQL Lab

Open **SQL Lab** from the study page to query a sample store dataset. The mini-project covers best-selling products, monthly revenue, and repeat customers. Queries run against an isolated, read-only SQLite dataset and require the Node server. The lab is available to guests and requires no AI key.

## Configure AI tutoring

Set `OPENAI_API_KEY` and `OPENAI_MODEL` in the server environment, then restart the server. The tutor is available to signed-in users. It sends the selected lesson and the current question to OpenAI. Each question is independent. Keep the API key in server configuration.

## Deploy

Run the Node server with HTTPS at the hosting layer, `NODE_ENV=production` for secure cookies, `HOST=0.0.0.0` if the platform routes requests over the container network, and the platform-provided `PORT`. Set `DATABASE_PATH` to a file on persistent writable storage and include it in your backups. Public registration is enabled. Use the hosting platform's traffic controls and provider budget settings for public deployments.

To host only the browser-based guest mode, serve `index.html` and `app.js` with a static host. GitHub Pages supports this mode.

## Add lessons

Add a lesson to a topic in `app.js` with a unique lowercase ID made of letters and hyphens, an explanation, an example, a walkthrough, a quiz question, choices, and a zero-based answer index. Keep the ID stable because it identifies saved study data.
