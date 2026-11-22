'use strict';

const tasks = [
  {
    prompt: 'Return the three products with the most units sold. Show product name, then units sold. Sort by units sold descending and product name ascending for ties.',
    hint: 'Group by product, use SUM(quantity), and apply LIMIT after sorting.'
  },
  {
    prompt: 'Show each month (YYYY-MM) and its total revenue in cents, in chronological order. Return month first, then revenue.',
    hint: 'Use substr(order_date, 1, 7) for the month and sum quantity × unit_price_cents.'
  },
  {
    prompt: 'Find customers who placed at least two distinct orders. Return customer name, then order count, sorted by customer name.',
    hint: 'Use COUNT(DISTINCT order_id) because an order can have multiple products. Filter groups with HAVING.'
  }
];

const byId = id => document.getElementById(id);
const task = byId('task');
const drafts = tasks.map(() => 'SELECT * FROM orders LIMIT 5;');
let selected = 0;

function showHint(visible) {
  byId('hint-text').hidden = !visible;
  byId('hint').textContent = visible ? 'Hide hint' : 'Show hint';
  byId('hint').setAttribute('aria-expanded', String(visible));
}

function showTask() {
  byId('prompt').textContent = tasks[selected].prompt;
  byId('hint-text').textContent = tasks[selected].hint;
  byId('sql').value = drafts[selected];
  byId('status').textContent = '';
  byId('results').replaceChildren();
  showHint(false);
}

function showResults(columns, rows) {
  const table = document.createElement('table');
  const head = table.createTHead().insertRow();
  for (const column of columns) {
    const cell = document.createElement('th');
    cell.scope = 'col';
    cell.textContent = column;
    head.append(cell);
  }
  const body = table.createTBody();
  for (const values of rows) {
    const row = body.insertRow();
    for (const value of values) row.insertCell().textContent = value ?? 'NULL';
  }
  byId('results').replaceChildren(table);
}

task.addEventListener('change', () => {
  drafts[selected] = byId('sql').value;
  selected = task.selectedIndex;
  showTask();
});
byId('hint').addEventListener('click', () => showHint(byId('hint-text').hidden));
byId('query-form').addEventListener('submit', async event => {
  event.preventDefault();
  const exercise = selected;
  const run = byId('run');
  run.disabled = true;
  byId('status').textContent = 'Running query…';
  byId('results').replaceChildren();
  try {
    const response = await fetch('/api/lab/query', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({task: exercise, sql: byId('sql').value})
    });
    if (response.status === 404 || response.status === 405 || response.status === 501) {
      throw new Error('Start the EduSphere Node server to run SQL queries.');
    }
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    if (exercise !== selected) return;
    showResults(result.columns, result.rows);
    byId('status').textContent = result.correct
      ? 'Correct. Your results match the exercise.'
      : `Returned ${result.rows.length} rows. Check the requested columns, values, and sort order.`;
  } catch (error) {
    if (exercise === selected) byId('status').textContent = error.message;
  } finally {
    run.disabled = false;
  }
});
showTask();
