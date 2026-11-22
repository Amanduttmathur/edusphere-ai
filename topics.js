'use strict';

const byId = id => document.getElementById(id);
const topics = new Map();

async function request(route, payload) {
  const response = await fetch(route, payload ? {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload)
  } : {});
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Request failed.');
  return result;
}

function showTopic(topic) {
  byId('path-title').textContent = topic.title;
  byId('prompt').hidden = true;
  const list = byId('lessons');
  list.replaceChildren();
  topic.lessons.forEach((lesson, index) => {
    const section = document.createElement('section');
    const title = document.createElement('h3');
    title.textContent = lesson.title;
    const body = document.createElement('p');
    body.textContent = lesson.body;
    const example = document.createElement('pre');
    example.textContent = lesson.example;
    const quiz = document.createElement('form');
    const group = document.createElement('fieldset');
    const question = document.createElement('legend');
    question.textContent = lesson.question;
    group.append(question);
    lesson.choices.forEach((choice, position) => {
      const label = document.createElement('label');
      label.className = 'choice';
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = `answer-${index}`;
      radio.value = position;
      radio.required = true;
      label.append(radio, choice);
      group.append(label);
    });
    const check = document.createElement('button');
    check.textContent = 'Check answer';
    const feedback = document.createElement('p');
    feedback.className = 'feedback';
    feedback.setAttribute('role', 'status');
    quiz.append(group, check, feedback);
    quiz.addEventListener('submit', event => {
      event.preventDefault();
      const selected = new FormData(quiz).get(`answer-${index}`);
      if (selected === null) return;
      feedback.textContent = Number(selected) === lesson.answer
        ? `Correct. ${lesson.explanation}`
        : 'Try again after reviewing the worked example.';
    });
    section.append(title, body, example, quiz);
    list.append(section);
  });
}

function renderSaved() {
  const list = byId('saved-topics');
  list.replaceChildren();
  if (!topics.size) list.textContent = 'Your generated topics will appear here.';
  for (const topic of topics.values()) {
    const button = document.createElement('button');
    button.textContent = topic.title;
    button.addEventListener('click', () => showTopic(topic));
    list.append(button);
  }
}

byId('generate').addEventListener('submit', async event => {
  event.preventDefault();
  const button = byId('create');
  button.disabled = true;
  byId('status').textContent = 'Generating your learning path…';
  try {
    const {topic} = await request('/api/topics', {topic: byId('topic').value});
    topics.set(topic.id, topic);
    renderSaved();
    showTopic(topic);
    byId('status').textContent = 'Learning path saved to My Topics.';
  } catch (error) {
    byId('status').textContent = error.message;
  } finally {
    button.disabled = false;
  }
});

async function initialize() {
  const session = await request('/api/session');
  if (!session.username) {
    const link = document.createElement('a');
    link.href = './index.html#account';
    link.textContent = 'Sign in on the Study page';
    byId('status').replaceChildren(link, ' to use My Topics.');
    return;
  }
  const saved = await request('/api/topics');
  for (const topic of saved.topics) topics.set(topic.id, topic);
  renderSaved();
  byId('generate').hidden = !session.chatEnabled;
  byId('status').textContent = session.chatEnabled ? '' :
    'Topic generation requires a configured AI model. You can still open saved topics.';
}

initialize().catch(() => {
  byId('status').textContent = 'My Topics requires the running EduSphere Node server.';
});