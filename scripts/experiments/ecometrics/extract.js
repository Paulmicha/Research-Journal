/**
 * @file
 * Converts the data sources into a single sqlite file.
 *
 * @see scripts/experiments/ecometrics/fetch.sh
 *
 * @example
 *   # From project docroot :
 *   node scripts/experiments/ecometrics/extract.js
 */

const { write_file } = require('../../fs');
const initSqlJs = require('../../../static/sql-wasm.js');

initSqlJs().then(SQL => {
	var db = new SQL.Database();
	// Run a query without reading the results
	db.run("CREATE TABLE test (col1, col2);");
	// Insert two rows: (1,111) and (2,222)
	db.run("INSERT INTO test VALUES (?,?), (?,?)", [1,111,2,222]);

	try {
		write_file(
			'static/data/ecometrics.sqlite',
			new Buffer.from(db.export())
		);
	} catch (error) {
		console.log(error);
	}
});
