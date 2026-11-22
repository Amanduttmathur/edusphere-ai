'use strict';

const topics = {
  Python: [
    {
      id: 'python-lists', title: 'Lists and indexing',
      body: 'A list stores items in order. Python starts counting list positions at zero, and negative indexes count backward from the end.',
      example: 'scores = [72, 85, 91]\nprint(scores[0])   # 72\nprint(scores[-1])  # 91',
      walkthrough: 'Index 0 selects the first score. Index -1 starts one position from the end, so it selects 91.',
      question: 'What does scores[1] return?', choices: ['72', '85', '91'], answer: 1
    },
    {
      id: 'python-loops', title: 'Loop through a list',
      body: 'A for loop visits each item in a list in order. A running total keeps track of the sum as the loop executes.',
      example: 'total = 0\nfor score in [3, 5, 7]:\n    total += score\nprint(total)  # 15',
      walkthrough: 'The total starts at zero and becomes 3, then 8, then 15.',
      question: 'How many times does the loop body run?', choices: ['2', '3', '15'], answer: 1
    },
    {
      id: 'python-dicts', title: 'Look up values in dictionaries',
      body: 'A dictionary maps unique keys to values. Look up a key with brackets or use get() to supply a fallback for a missing key.',
      example: 'scores = {"Ada": 91, "Sam": 85}\nprint(scores.get("Noor", 0))  # 0',
      walkthrough: 'There is no Noor key, so get() returns the fallback value of 0.',
      question: 'Which expression retrieves Ada’s score?', choices: ['scores[0]', 'scores["Ada"]', 'scores["Noor"]'], answer: 1
    }
  ],
  SQL: [
    {
      id: 'sql-filter', title: 'Filter rows with WHERE',
      body: 'SELECT chooses which columns to return. WHERE keeps rows that satisfy a condition before they reach the result.',
      example: 'SELECT name, score\nFROM results\nWHERE score >= 80;',
      walkthrough: 'A score of 80 or 92 meets the condition. A score of 79 does not.',
      question: 'Which score is included?', choices: ['79', '70', '80'], answer: 2
    },
    {
      id: 'sql-groups', title: 'Summarize rows with GROUP BY',
      body: 'GROUP BY gives aggregate functions a group of rows to summarize. COUNT(*) counts every row within each group.',
      example: 'SELECT topic, COUNT(*) AS lessons\nFROM lesson\nGROUP BY topic;',
      walkthrough: 'If three lesson rows have topic SQL and two have topic Python, the query returns two groups with counts of 3 and 2.',
      question: 'What does this query return for each topic?', choices: ['Its lesson count', 'Its longest lesson', 'Its first lesson only'], answer: 0
    },
    {
      id: 'sql-joins', title: 'Connect tables with an INNER JOIN',
      body: 'An INNER JOIN combines rows that meet the join condition. Joining on a topic ID lets us show the topic name for each matching lesson.',
      example: 'SELECT lesson.title, topic.name\nFROM lesson\nINNER JOIN topic ON lesson.topic_id = topic.id;',
      walkthrough: 'For a lesson with topic_id 4, the query looks for the topic row with id 4. The result includes the pair when the IDs match.',
      question: 'What happens to a lesson with no matching topic row?', choices: ['It appears twice', 'It is excluded', 'It appears with a blank topic'], answer: 1
    }
  ],
  'Machine Learning': [
    {
      id: 'ml-splits', title: 'Split training and test data',
      body: 'Use the training set to fit a model. Hold back a test set to estimate how the final model performs on unseen examples.',
      example: '100 rows\n80 training rows → fit the model\n20 test rows → evaluate the final model',
      walkthrough: 'The model learns from 80 rows. The remaining 20 rows supply an independent evaluation when kept out of model selection and fitting.',
      question: 'Which split should you use to fit the model?', choices: ['Training set', 'Test set', 'Both sets'], answer: 0
    },
    {
      id: 'ml-precision', title: 'Read precision and recall',
      body: 'Precision measures how many predicted positives are correct. Recall measures how many actual positives the model finds.',
      example: 'Correct positive predictions: 8\nAll positive predictions: 10\nAll actual positives: 20\nPrecision = 8 / 10\nRecall = 8 / 20',
      walkthrough: 'The model gets 80% of its positive predictions right and finds 40% of the actual positives.',
      question: 'What is recall in this example?', choices: ['80%', '50%', '40%'], answer: 2
    },
    {
      id: 'ml-overfitting', title: 'Spot overfitting',
      body: 'Overfitting happens when a model learns patterns that are too specific to the training examples. A large gap between training and validation scores can be a sign.',
      example: 'Training accuracy:   99%\nValidation accuracy:  68%',
      walkthrough: 'The model performs much better on examples it trained on. Compare simpler models on the same validation split to see whether they generalize better.',
      question: 'Which pattern is consistent with overfitting?', choices: ['Very high training accuracy and much lower validation accuracy', 'Identical accuracy on both sets', 'Higher validation accuracy alone'], answer: 0
    }
  ]
};

const byId = id => document.getElementById(id);
const storageKey = 'edusphere-ai-study-v1';
const lessons = Object.values(topics).flat();
const lessonIds = new Set(lessons.map(lesson => lesson.id));
const state = {saved: new Set(), completed: new Set(), notes: Object.create(null)};
let activeTopic = 'Python';
let index = 0;

try {
  const data = JSON.parse(localStorage.getItem(storageKey)) || {};
  for (const field of ['saved', 'completed']) {
    if (Array.isArray(data[field])) state[field] = new Set(data[field].filter(id => lessonIds.has(id)));
  }
  for (const id of lessonIds) {
    if (typeof data.notes?.[id] === 'string') state.notes[id] = data.notes[id];
  }
} catch {
  byId('storage-status').textContent = 'Saved study data could not be loaded.';
}

function persist() {
  try {
    localStorage.setItem(storageKey, JSON.stringify({
      saved: [...state.saved], completed: [...state.completed], notes: state.notes
    }));
    byId('storage-status').textContent = 'Notes and progress are saved in this browser.';
  } catch {
    byId('storage-status').textContent = 'Browser storage is unavailable. Your changes last for this session.';
  }
}

function currentLesson() {
  return topics[activeTopic][index];
}

function showView(showSaved) {
  byId('study').hidden = showSaved;
  byId('saved').hidden = !showSaved;
  byId('study-view').setAttribute('aria-pressed', String(!showSaved));
  byId('saved-view').setAttribute('aria-pressed', String(showSaved));
  if (showSaved) renderSaved();
}

function updateProgress() {
  const group = topics[activeTopic];
  const complete = group.filter(lesson => state.completed.has(lesson.id)).length;
  byId('progress').max = group.length;
  byId('progress').value = complete;
  byId('progress-label').textContent = `${complete} of ${group.length} quizzes completed`;
}

function updateBookmark() {
  const saved = state.saved.has(currentLesson().id);
  byId('bookmark').textContent = saved ? 'Remove saved lesson' : 'Save lesson';
  byId('bookmark').setAttribute('aria-pressed', String(saved));
}

function openTopic(topic, lessonIndex = 0) {
  activeTopic = topic;
  index = lessonIndex;
  showView(false);
  renderLesson();
}

function renderLesson() {
  const lesson = currentLesson();
  for (const button of byId('topics').children) {
    button.setAttribute('aria-pressed', String(button.textContent === activeTopic));
  }
  byId('lesson-counter').textContent = `${activeTopic} · Lesson ${index + 1} of ${topics[activeTopic].length}`;
  byId('lesson-title').textContent = lesson.title;
  byId('lesson-body').textContent = lesson.body;
  byId('example').textContent = lesson.example;
  byId('question').textContent = lesson.question;
  byId('feedback').textContent = state.completed.has(lesson.id) ? 'Quiz completed.' : '';
  byId('help-answer').textContent = '';
  byId('note').value = state.notes[lesson.id] || '';
  byId('previous').disabled = index === 0;
  byId('next').disabled = index === topics[activeTopic].length - 1;
  byId('choices').replaceChildren(...lesson.choices.map((choice, position) => {
    const label = document.createElement('label');
    label.className = 'choice';
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'choice';
    radio.value = String(position);
    radio.required = true;
    label.append(radio, choice);
    return label;
  }));
  updateBookmark();
  updateProgress();
}

function renderSaved() {
  const list = byId('saved-list');
  list.replaceChildren();
  if (state.saved.size === 0) list.textContent = 'Save a lesson to review it here.';
  for (const [topic, group] of Object.entries(topics)) {
    group.forEach((lesson, position) => {
      if (!state.saved.has(lesson.id)) return;
      const button = document.createElement('button');
      button.textContent = `${lesson.title} · ${topic}`;
      button.addEventListener('click', () => openTopic(topic, position));
      list.append(button);
    });
  }
}

for (const topic of Object.keys(topics)) {
  const button = document.createElement('button');
  button.textContent = topic;
  button.addEventListener('click', () => openTopic(topic));
  byId('topics').append(button);
}

byId('quiz').addEventListener('submit', event => {
  event.preventDefault();
  const lesson = currentLesson();
  const selected = Number(new FormData(event.currentTarget).get('choice'));
  if (selected !== lesson.answer) {
    byId('feedback').textContent = 'Try again. Review the example above.';
    return;
  }
  state.completed.add(lesson.id);
  persist();
  updateProgress();
  byId('feedback').textContent = `Correct. ${lesson.walkthrough}`;
});
byId('note').addEventListener('input', event => {
  state.notes[currentLesson().id] = event.target.value;
  persist();
});
byId('bookmark').addEventListener('click', () => {
  const id = currentLesson().id;
  if (state.saved.has(id)) state.saved.delete(id);
  else state.saved.add(id);
  persist();
  updateBookmark();
});
byId('previous').addEventListener('click', () => openTopic(activeTopic, index - 1));
byId('next').addEventListener('click', () => openTopic(activeTopic, index + 1));
byId('study-view').addEventListener('click', () => showView(false));
byId('saved-view').addEventListener('click', () => showView(true));
byId('explain').addEventListener('click', () => {
  byId('help-answer').textContent = currentLesson().body;
});
byId('show-example').addEventListener('click', () => {
  byId('help-answer').textContent = currentLesson().walkthrough;
});
renderLesson();
