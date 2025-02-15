'use-strict';
const { experiment, test, beforeEach, afterEach } = exports.lab = require('@hapi/lab').script();
const { expect } = require('@hapi/code');
const sandbox = require('sinon').createSandbox();
const repos = require('../../../src/lib/repo/kpi-reporting');
const { pool } = require('../../../src/lib/connectors/db');

experiment('./lib/repo/kpi-reporting', () => {
  beforeEach(async => {
    sandbox.stub(pool, 'query').resolves({ rows: [], error: null });
  });

  afterEach(async => {
    sandbox.restore();
  });

  const query = `
  SELECT
    SUM(CASE WHEN user_type IS NULL AND status = 'due' THEN 1 ELSE 0 END)::integer AS due,
    SUM(CASE WHEN user_type = 'internal' AND status = 'completed' AND received_date <= due_date THEN 1 ELSE 0 END)::integer AS internal_on_time,
    SUM(CASE WHEN user_type = 'internal' AND status = 'completed' AND received_date > due_date THEN 1 ELSE 0 END)::integer AS internal_late,
    SUM(CASE WHEN user_type = 'external' AND status = 'completed' AND received_date <= due_date THEN 1 ELSE 0 END)::integer AS external_on_time,
    SUM(CASE WHEN user_type = 'external' AND status = 'completed' AND received_date > due_date THEN 1 ELSE 0 END)::integer AS external_late
  FROM returns.returns as r
  LEFT JOIN
  (SELECT user_type, return_id FROM returns.versions 
  WHERE current = true
  ) AS v ON
  v.return_id = r.return_id
  WHERE r.status <> 'void'
  AND r.start_date >= $1 AND r.end_date <= $2
  AND (r.metadata->'isSummer') = $3;`;

  test('the correct params are used to call db pool query', async () => {
    await repos.findReturnsKpiDataBySeason();
    expect(pool.query.lastCall.args[0]).to.be.equal(query);
    expect(pool.query.lastCall.args.length).to.be.equal(2);
  });

  test('the correct data shape is returned', async () => {
    const response = await repos.findReturnsKpiDataBySeason();
    expect(response).to.equal({ data: [] });
  });
});
