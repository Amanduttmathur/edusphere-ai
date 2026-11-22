'use strict';

const { parentPort, workerData } = require('node:worker_threads');
const { DatabaseSync, constants } = require('node:sqlite');

const tasks = [
  `SELECT product, SUM(quantity) AS units_sold
   FROM orders GROUP BY product ORDER BY units_sold DESC, product LIMIT 3`,
  `SELECT substr(order_date, 1, 7) AS month, SUM(quantity * unit_price_cents) AS revenue_cents
   FROM orders GROUP BY month ORDER BY month`,
  `SELECT customer, COUNT(DISTINCT order_id) AS order_count
   FROM orders GROUP BY customer HAVING order_count >= 2 ORDER BY customer`
];

const db = new DatabaseSync(':memory:', {allowExtension: false});
db.exec(`
  CREATE TABLE orders (
    order_id INTEGER, order_date TEXT, customer TEXT, product TEXT,
    quantity INTEGER, unit_price_cents INTEGER
  );
  INSERT INTO orders VALUES
    (101, '2026-01-07', 'Asha', 'Notebook', 3, 450),
    (101, '2026-01-07', 'Asha', 'Desk Lamp', 1, 2499),
    (102, '2026-01-13', 'Kabir', 'Mug', 2, 899),
    (103, '2026-01-24', 'Mina', 'Pen Set', 2, 650),
    (104, '2026-02-02', 'Asha', 'Pen Set', 1, 650),
    (105, '2026-02-11', 'Noor', 'Desk Lamp', 2, 2499),
    (106, '2026-02-19', 'Mina', 'Mug', 1, 899),
    (106, '2026-02-19', 'Mina', 'Notebook', 2, 450),
    (107, '2026-03-04', 'Rahul', 'Mug', 4, 899),
    (108, '2026-03-12', 'Kabir', 'Notebook', 1, 450),
    (109, '2026-03-23', 'Leena', 'Pen Set', 2, 650),
    (109, '2026-03-23', 'Leena', 'Notebook', 1, 450);
  PRAGMA query_only = ON;
`);

const functions = new Set([
  'abs', 'avg', 'coalesce', 'count', 'date', 'ifnull', 'length', 'lower',
  'max', 'min', 'nullif', 'round', 'strftime', 'substr', 'substring', 'sum',
  'total', 'trim', 'upper'
]);

db.setAuthorizer((action, table, detail) => {
  if (action === constants.SQLITE_SELECT ||
      (action === constants.SQLITE_READ && table === 'orders') ||
      (action === constants.SQLITE_FUNCTION && functions.has(detail?.toLowerCase()))) {
    return constants.SQLITE_OK;
  }
  return constants.SQLITE_DENY;
});

function run(sql) {
  const plan = db.prepare(`EXPLAIN ${sql}`).all();
  if (plan.filter(step => step.opcode === 'OpenRead').length > 1) {
    throw new Error('Use a single scan of the orders table for this exercise.');
  }
  const statement = db.prepare(sql);
  statement.setReturnArrays(true);
  const columns = statement.columns().map(column => column.name);
  if (!columns.length || columns.length > 20) throw new Error('Return between 1 and 20 columns.');
  const rows = [];
  for (const row of statement.iterate()) {
    if (rows.length === 100) throw new Error('Limit the result to 100 rows.');
    rows.push(row);
  }
  return {columns, rows};
}

try {
  const {sql, task} = workerData;
  const result = run(sql);
  const expected = run(tasks[task]);
  const correct = result.columns.length === expected.columns.length &&
    JSON.stringify(result.rows) === JSON.stringify(expected.rows);
  parentPort.postMessage({...result, correct});
} catch (error) {
  parentPort.postMessage({error: error.message});
} finally {
  db.close();
}
