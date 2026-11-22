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
  ],
  "Statistics": [
    {
      id: 'stats-center',
      title: "Mean and median",
      body: "The mean is the sum divided by the count. The median is the middle of the sorted data, or the average of the two middle values.",
      example: "2, 3, 4, 5, 26 → mean 8, median 4",
      walkthrough: "The unusually large value raises the mean.",
      question: "Which summary is less sensitive to outliers?",
      choices: ["Mean","Median","Both equally"],
      answer: 1
    },
    {
      id: 'stats-range',
      title: "Measure the range",
      body: "Subtract the minimum from the maximum to measure the gap between the extremes.",
      example: "5, 8, 12, 14 → 14 − 5 = 9",
      walkthrough: "Only the smallest and largest values contribute.",
      question: "What is the range of 4, 6, 11?",
      choices: ["7","6","15"],
      answer: 0
    },
    {
      id: 'stats-correlation',
      title: "Interpret correlation",
      body: "Pearson correlation describes the direction and strength of a linear association.",
      example: "Hours studied and test scores: r = 0.72",
      walkthrough: "The association is positive. The coefficient alone cannot establish causation.",
      question: "What does r = −0.8 indicate?",
      choices: ["Positive linear association","No linear association","Negative linear association"],
      answer: 2
    }
  ],
  "Pandas": [
    {
      id: 'pandas-filter',
      title: "Filter rows",
      body: "A boolean mask selects the rows where a condition is true.",
      example: "df.loc[df['score'] >= 80, ['name', 'score']]",
      walkthrough: "The mask keeps scores of 80 or higher and returns two columns.",
      question: "Which score is included?",
      choices: ["79","80","60"],
      answer: 1
    },
    {
      id: 'pandas-missing',
      title: "Count missing values",
      body: "Use isna() to find missing values before deciding how to handle them.",
      example: "df['score'].isna().sum()",
      walkthrough: "The sum counts rows where isna() returned True.",
      question: "How many missing values are in [10, None, 20, None]?",
      choices: ["0","4","2"],
      answer: 2
    },
    {
      id: 'pandas-groups',
      title: "Summarize groups",
      body: "Use groupby() to split rows by a shared value and summarize the groups.",
      example: "df.groupby('region')['sales'].sum()",
      walkthrough: "Each region gets its own total.",
      question: "Which method gives average sales per region?",
      choices: ["mean()","sum()","size()"],
      answer: 0
    }
  ],
  "NumPy": [
    {
      id: 'numpy-arrays',
      title: "Multiply array elements",
      body: "NumPy applies multiplication by a scalar to each array element.",
      example: "np.array([2, 4, 6]) * 3\n# [ 6 12 18]",
      walkthrough: "The second value is 4 multiplied by 3.",
      question: "What is the second output value?",
      choices: ["6","8","12"],
      answer: 2
    },
    {
      id: 'numpy-shapes',
      title: "Read array shapes",
      body: "A two-dimensional array reports the number of rows and columns in that order.",
      example: "np.array([[1, 2, 3], [4, 5, 6]]).shape\n# (2, 3)",
      walkthrough: "There are two rows with three values each.",
      question: "How many columns are in shape (4, 2)?",
      choices: ["4","2","8"],
      answer: 1
    },
    {
      id: 'numpy-axes',
      title: "Sum across an axis",
      body: "Summing along axis 0 returns column totals. Summing along axis 1 returns row totals.",
      example: "a = np.array([[1, 2], [3, 4]])\na.sum(axis=0)  # [4 6]",
      walkthrough: "The first column adds 1 and 3.",
      question: "What does a.sum(axis=1) return?",
      choices: ["[3, 7]","[4, 6]","[10]"],
      answer: 0
    }
  ],
  "Data Visualization": [
    {
      id: 'viz-bars',
      title: "Compare categories",
      body: "Bar charts show how values vary across categories. Start the numeric axis at zero to preserve proportional bar lengths.",
      example: "Orders by channel: Website 120, Store 80, Phone 40",
      walkthrough: "The website bar is three times the length of the phone bar.",
      question: "Which chart best compares order counts across channels?",
      choices: ["Scatter plot","Bar chart","Line chart"],
      answer: 1
    },
    {
      id: 'viz-lines',
      title: "Show a time trend",
      body: "A line chart connects observations in time order.",
      example: "January: 80\nFebruary: 100\nMarch: 92",
      walkthrough: "Orders rose into February and then declined.",
      question: "Which month had the highest order count?",
      choices: ["January","March","February"],
      answer: 2
    },
    {
      id: 'viz-scatter',
      title: "Compare numeric variables",
      body: "A scatter plot gives each observation two numeric coordinates.",
      example: "One point per order: x = item count, y = order value",
      walkthrough: "Each point pairs the item count with the value for that order.",
      question: "Which chart shows the relationship between these two variables?",
      choices: ["Scatter plot","Pie chart","Single-series bar chart"],
      answer: 0
    }
  ],
  "Model Evaluation": [
    {
      id: 'eval-errors',
      title: "Read classification errors",
      body: "A false negative occurs when the actual class is positive and the predicted class is negative.",
      example: "Actual: fraud\nPrediction: legitimate",
      walkthrough: "The model missed fraud, the positive class.",
      question: "What is a legitimate order incorrectly flagged as fraud?",
      choices: ["False positive","True positive","False negative"],
      answer: 0
    },
    {
      id: 'eval-baseline',
      title: "Compare with a baseline",
      body: "A baseline provides a simple benchmark. One baseline predicts the majority class for every example.",
      example: "95 legitimate orders and 5 fraud cases\nPredict legitimate every time → 95% accuracy",
      walkthrough: "The model has high accuracy and detects zero fraud cases.",
      question: "What measures the fraction of fraud cases detected?",
      choices: ["Accuracy","Fraud precision","Fraud recall"],
      answer: 2
    },
    {
      id: 'eval-folds',
      title: "Use cross-validation",
      body: "Cross-validation rotates the portion of the development dataset used for validation.",
      example: "Five folds: train on four and validate on one per round.",
      walkthrough: "Every fold serves as validation once. A separate test set can evaluate the final model.",
      question: "How many validation rounds are in five-fold cross-validation?",
      choices: ["4","5","10"],
      answer: 1
    }
  ]
};

const byId = id => document.getElementById(id);
const storageKey = 'edusphere-ai-study-v1';
const lessons = Object.values(topics).flat();
const lessonIds = new Set(lessons.map(lesson => lesson.id));
const guestState = {saved: new Set(), completed: new Set(), notes: Object.create(null)};
let state = guestState;
let username = null;
let chatEnabled = false;
let updates = Promise.resolve();
const pending = new Map();
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

function persist(change) {
  if (username) {
    const lessonId = currentLesson().id;
    pending.set(lessonId, {...pending.get(lessonId), ...change});
    queueSync();
    return;
  }
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
  byId('chat-answer').textContent = '';
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

const topicFilter = byId('topic-filter');
const topicButtons = Object.entries(topics).map(([topic, group]) => {
  const button = document.createElement('button');
  button.textContent = topic;
  button.addEventListener('click', () => {
    if (topic !== activeTopic) openTopic(topic);
  });
  byId('topics').append(button);
  const searchable = [topic, ...group.map(lesson => lesson.title)].join(' ').toLowerCase();
  return {button, searchable};
});

function filterTopics() {
  const words = topicFilter.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
  let count = 0;
  for (const {button, searchable} of topicButtons) {
    button.hidden = !words.every(word => searchable.includes(word));
    if (!button.hidden) count += 1;
  }
  byId('clear-topic-filter').hidden = !topicFilter.value;
  byId('topic-filter-status').textContent = !words.length ? '' : count
    ? `${count} matching ${count === 1 ? 'topic' : 'topics'}`
    : 'No matching topics. Try a different term or clear the search.';
}

topicFilter.addEventListener('input', filterTopics);
byId('topic-search').addEventListener('submit', event => {
  event.preventDefault();
  const matches = topicButtons.filter(({button}) => !button.hidden);
  if (matches.length === 1) {
    matches[0].button.click();
    matches[0].button.focus();
  }
});
byId('clear-topic-filter').addEventListener('click', () => {
  topicFilter.value = '';
  filterTopics();
  topicFilter.focus();
});
filterTopics();

byId('quiz').addEventListener('submit', event => {
  event.preventDefault();
  const lesson = currentLesson();
  const selected = Number(new FormData(event.currentTarget).get('choice'));
  if (selected !== lesson.answer) {
    byId('feedback').textContent = 'Try again. Review the example above.';
    return;
  }
  state.completed.add(lesson.id);
  persist({completed: true});
  updateProgress();
  byId('feedback').textContent = `Correct. ${lesson.walkthrough}`;
});
byId('note').addEventListener('input', event => {
  state.notes[currentLesson().id] = event.target.value;
  persist({note: event.target.value});
});
byId('bookmark').addEventListener('click', () => {
  const id = currentLesson().id;
  if (state.saved.has(id)) state.saved.delete(id);
  else state.saved.add(id);
  persist({saved: state.saved.has(id)});
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

async function request(route, method = 'GET', payload) {
  const response = await fetch(route, {
    method,
    headers: payload === undefined ? {} : {'Content-Type': 'application/json'},
    body: payload === undefined ? undefined : JSON.stringify(payload)
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Request failed.');
  return result;
}

function queueSync() {
  const owner = username;
  updates = updates.then(async () => {
    if (owner !== username || !pending.size) return;
    byId('storage-status').textContent = 'Syncing study changes…';
    try {
      for (const [lessonId, change] of pending) {
        await request('/api/study', 'PATCH', {lessonId, ...change});
        if (pending.get(lessonId) === change) pending.delete(lessonId);
      }
      byId('retry-sync').hidden = true;
      byId('storage-status').textContent = pending.size ? 'Syncing study changes…' : 'Study changes synced.';
    } catch (error) {
      byId('retry-sync').hidden = false;
      byId('storage-status').textContent = `Changes could not sync. ${error.message}`;
    }
  });
}

async function refreshAccount() {
  const session = await request('/api/session');
  const nextState = session.username
    ? {saved: new Set(), completed: new Set(), notes: Object.create(null)}
    : guestState;
  if (session.username) {
    const {lessons: storedLessons} = await request('/api/study');
    for (const lesson of storedLessons) {
      if (lesson.saved) nextState.saved.add(lesson.lesson_id);
      if (lesson.completed) nextState.completed.add(lesson.lesson_id);
      nextState.notes[lesson.lesson_id] = lesson.note;
    }
  }
  username = session.username;
  chatEnabled = session.chatEnabled;
  state = nextState;
  byId('account').hidden = false;
  byId('account-form').hidden = Boolean(username);
  byId('sign-out').hidden = !username;
  byId('retry-sync').hidden = true;
  byId('chat-panel').hidden = !username || !chatEnabled;
  byId('account-status').textContent = username
    ? `Signed in as ${username}.${chatEnabled ? '' : ' AI chat requires server configuration.'}`
    : 'Sign in to sync study activity across devices. Guest progress stays in this browser.';
  byId('storage-status').textContent = username ? 'Study changes sync to your account.' :
    'Notes and progress are saved in this browser.';
  renderLesson();
  if (!byId('saved').hidden) renderSaved();
}

byId('retry-sync').addEventListener('click', queueSync);
byId('account-form').addEventListener('submit', async event => {
  event.preventDefault();
  const buttons = [byId('sign-in'), byId('register')];
  buttons.forEach(button => { button.disabled = true; });
  const route = event.submitter?.id === 'register' ? '/api/register' : '/api/login';
  try {
    await request(route, 'POST', {
      username: byId('username').value,
      password: byId('password').value
    });
    byId('account-form').reset();
    await refreshAccount();
  } catch (error) {
    byId('account-status').textContent = error.message;
  } finally {
    buttons.forEach(button => { button.disabled = false; });
  }
});
byId('sign-out').addEventListener('click', async event => {
  const button = event.currentTarget;
  button.disabled = true;
  byId("study").inert = true;
  try {
    queueSync();
    await updates;
    if (pending.size) throw new Error('Retry syncing your study changes before signing out.');
    await request('/api/logout', 'POST', {});
    await refreshAccount();
  } catch (error) {
    byId('account-status').textContent = error.message;
  } finally {
    button.disabled = false;
    byId("study").inert = false;
  }
});
byId('chat-form').addEventListener('submit', async event => {
  event.preventDefault();
  const lesson = currentLesson();
  const owner = username;
  const question = byId('chat-question').value.trim();
  if (!question) return;
  byId('ask').disabled = true;
  byId('chat-answer').textContent = 'Waiting for the tutor…';
  try {
    const response = await request('/api/chat', 'POST', {
      question, lesson: `${lesson.title}\n${lesson.body}\n${lesson.example}`
    });
    if (currentLesson() === lesson && username === owner) byId('chat-answer').textContent = response.answer;
  } catch (error) {
    if (currentLesson() === lesson && username === owner) byId('chat-answer').textContent = error.message;
  } finally {
    byId('ask').disabled = false;
  }
});

if (location.protocol === 'http:' || location.protocol === 'https:') {
  refreshAccount().catch(() => { /* Static hosting keeps guest study mode available. */ });
}
