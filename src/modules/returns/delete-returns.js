const { pool } = require('../../lib/connectors/db');

exports.deleteReturnById = async (request) => pool.query(`
    DELETE FROM returns.lines WHERE version_id = (SELECT version_id from returns.versions WHERE return_id = '${request.params.returnId}');
    DELETE FROM returns.versions WHERE return_id = '${request.params.returnId}';
    UPDATE returns.returns SET status='due', received_date = NULL WHERE return_id = '${request.params.returnId}';
`);
