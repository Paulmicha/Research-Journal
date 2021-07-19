/**
 * @file
 * Converts the raw data sources for the "Ecometrics" experiment.
 *
 * @see scripts/experiments/ecometrics/fetch.sh
 *
 * @example
 *   # (re)Process the fetched data (run from project docroot) :
 *   node scripts/experiments/ecometrics/extract.js
 */

const fs = require('fs');
const slugify = require('@sindresorhus/slugify');
const { write_file } = require('../../fs');
const initSqlJs = require('../../../static/sql-wasm.js');

// For now, we're only using the "FR" list.
const boaviztaCsvFile = 'private/footprint-data/boavizta-data-fr.csv';
const boaviztaCsvSeparator = ';';

if (!fs.existsSync(boaviztaCsvFile)) {
	console.log('Please run : scripts/experiments/ecometrics/fetch.sh');
	return;
}

const rawData = fs.readFileSync(boaviztaCsvFile)
	.toString() // convert Buffer to string
	.split('\n') // split string to lines
	.map(e => e.trim()) // remove white spaces for each line
	.map(e => e.split(boaviztaCsvSeparator) // split each line to array
	.map(e => e.trim())); // remove white spaces for each column

const data = {};
const colNames = rawData.shift();

data.colNames = colNames;
data.colIds = colNames.map(colName => slugify(colName, { separator: '_' }));
data.rows = rawData;

// Write as sqlite file.
initSqlJs().then(SQL => {
	var db = new SQL.Database();

	db.run(`CREATE TABLE devices (${ data.colIds.join(', ') });`);
	data.rows.forEach(row => db.run(
		`INSERT INTO devices VALUES (${ colNames.map(c => '?').join(',') })`,
		row
	));

	db.run(`CREATE TABLE devicesCols (title);`);
	data.colNames.forEach(colName => db.run(`INSERT INTO devicesCols VALUES (?)`, [ colName ]));

	// Debug.
	// console.log(data.colIds);
	// console.log(data.colNames);
	// const stmt = db.prepare("SELECT * FROM devices");
	// stmt.bind();
	// while (stmt.step()) {
	// 	console.log(stmt.getAsObject())
	// }
	// stmt.free();
	// const res = db.exec("SELECT * FROM devicesCols");
	// console.log(res[0].values.map(v => v[0]));

	try {
		if (fs.existsSync('static/data/ecometrics.sqlite')) {
			fs.unlinkSync('static/data/ecometrics.sqlite');
		}
		write_file(
			'static/data/ecometrics.sqlite',
			new Buffer.from(db.export())
		);
	} catch (error) {
		console.log(error);
	}
});

// Write as json file.
try {
	if (fs.existsSync('static/data/ecometrics.json')) {
		fs.unlinkSync('static/data/ecometrics.json');
	}
	write_file(
		'static/data/ecometrics.json',
		JSON.stringify(data)
	);
} catch (error) {
	console.log(error);
}
