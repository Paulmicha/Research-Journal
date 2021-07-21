/**
 * @file
 * Converts the raw data sources for the "Ecometrics" experiment.
 *
 * @see scripts/experiments/ecometrics/fetch.sh
 *
 * Currently outputs 2 different formats : Json + Sqlite for comparing
 * performance (WIP).
 *
 * @see src/components/content/DigitalEcoMetrics.svelte
 * @see src/components/content/DigitalEcoMetricsJson.svelte
 *
 * @example
 *   # (re)Process the fetched data (run from project docroot) :
 *   node scripts/experiments/ecometrics/extract.js
 */

const fs = require('fs');
const slugify = require('@sindresorhus/slugify');
const { write_file } = require('../../fs');
const {
	devicesKeys,
	devicesFromBoaviztaNormalizeAll,
	devicesFromEcodiagNormalizeAll,
	co2EqKeys,
	co2EqNormalizeItem
} = require('./data_transforms');
const initSqlJs = require('../../../static/sql-wasm.js');

/**
 * Sqlite INSERT format helper.
 */
const props2Arr = eqObj => {
	const flattenedValues = [];
	Object.keys(eqObj).forEach(prop => {
		if (prop in eqObj) {
			if (Array.isArray(eqObj[prop]) || typeof(eqObj[prop]) === 'object') {
				flattenedValues.push(JSON.stringify(eqObj[prop]));
			} else {
				flattenedValues.push(eqObj[prop]);
			}
		} else {
			flattenedValues.push('');
		}
	});
	return flattenedValues;
};

// Data sources.
const { ecodiagDeviceList } = require('./ecodiag/devices.js');
const datagirJsonFile = 'private/co2-eq/equivalents.json';
const boaviztaCsvFile = 'private/footprint-data/boavizta-data-us.csv';
const boaviztaCsvSeparator = ',';

// Can't carry on without having downloaded the source files.
if (!fs.existsSync(boaviztaCsvFile) || !fs.existsSync(datagirJsonFile)) {
	console.log('Please run : scripts/experiments/ecometrics/fetch.sh');
	return;
}

// Load the CO2 equivalences Json file as array.
const co2EqRaw = JSON.parse(fs.readFileSync(datagirJsonFile).toString());

// Load the devices footprint CSV file as array.
const boaviztaExtractedData = fs.readFileSync(boaviztaCsvFile)
	.toString() // convert Buffer to string
	.split('\n') // split string to lines
	.map(e => e.trim()) // remove white spaces for each line
	.map(e => e.split(boaviztaCsvSeparator) // split each line to array
	.map(e => e.trim())) // remove white spaces for each column
	.filter(e => e != null && e != ''); // remove empty lines

// Aggregate normalized data from all sources.
const data = {};
const { boaviztaDevices, devicesColNames } = devicesFromBoaviztaNormalizeAll(boaviztaExtractedData);
const ecodiagDevices = devicesFromEcodiagNormalizeAll(ecodiagDeviceList);
const co2Eq = co2EqRaw.map(entry => co2EqNormalizeItem(entry));

// Debug.
// console.log(devicesColNames);
// console.log(boaviztaDevices[0]);
// console.log(ecodiagDevices[0]);
// console.log(co2Eq[0]);
// return;

// Merge into a single dataset.
data.devicesKeys = devicesKeys;
data.devicesColNames = props2Arr(devicesColNames);
data.devicesColNamesByKey = devicesColNames;
data.devices = [...boaviztaDevices, ...ecodiagDevices];
data.co2EqKeys = co2EqKeys;
data.co2Eq = co2Eq;

// Debug.
// for (let i = 0; i < 20; i++) {
// 	console.log(ecodiagDevices[Math.floor(Math.random() * ecodiagDevices.length)]);
// 	console.log(data.devices[Math.floor(Math.random() * data.devices.length)]);
// }
// return;

// Write as sqlite file.
initSqlJs().then(SQL => {
	var db = new SQL.Database();

	db.run(`CREATE TABLE co2Eq (${ data.co2EqKeys.join(', ') });`);
	data.co2Eq.forEach(eqObj => db.run(
		`INSERT INTO co2Eq VALUES (${ data.co2EqKeys.map(c => '?').join(',') })`,
		props2Arr(eqObj)
	));

	db.run(`CREATE TABLE devices (${ data.devicesKeys.join(', ') });`);
	data.devices.forEach(device => db.run(
		`INSERT INTO devices VALUES (${ data.devicesKeys.map(c => '?').join(',') })`,
		props2Arr(device)
	));

	db.run(`CREATE TABLE devicesCols (title);`);
	data.devicesColNames.forEach(colName => db.run(
		`INSERT INTO devicesCols VALUES (?)`,
		[ colName ]
	));

	// Debug.
	// console.log(data.co2EqKeys);
	// console.log(data.devicesKeys);
	// console.log(data.devicesColNames);
	// const stmt = db.prepare("SELECT * FROM co2Eq");
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
