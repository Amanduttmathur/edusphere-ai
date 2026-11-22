# EduSphere AI

EduSphere AI is a browser-based study workspace for short Python, SQL, and machine learning lessons. It includes nine original lessons, worked examples, interactive quizzes, bookmarks, notes, and topic progress.

**Maintainer** Aman Dutt Mathur ([@Amanduttmathur](https://github.com/Amanduttmathur))

## Run locally

From the repository root, run:

```sh
python3 -m http.server 8000
```

Then visit [localhost:8000](http://localhost:8000). The app has no build step, dependencies, or environment variables. It can also be hosted on any static web host.

Notes, progress, and bookmarks are stored in the current browser for the current site origin. Study help uses lesson explanations and worked examples. Live AI chat and account synchronization are outside this starter release.

## Add lessons

In `app.js`, add a lesson to the appropriate topic with a unique ID, explanation, example, walkthrough, quiz question, choices, and zero-based answer index. The ID identifies saved notes and progress, so keep it stable after publishing.
