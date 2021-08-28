/**
 * @file
 * Converts the raw data sources for the "Ecometrics" experiment.
 *
 * @see scripts/experiments/ecometrics/fetch.sh
 *
 * Currently outputs 2 different formats : Json + Sqlite for comparing
 * performance (WIP).
 *
 * For the Sqlite test :
 * @see src/components/content/DigitalEcoMetrics.svelte
 *
 * For the Json comparison :
 * @see src/components/content/DigitalEcoMetricsJson.svelte
 *
 * @example
 *   # (re)Process the fetched data (run from project docroot) :
 *   node scripts/experiments/ecometrics/extract.js
 */

const fs = require('fs');
const slugify = require('@sindresorhus/slugify');
const { write_file } = require('../../fs');
const { csvToArr, props2Arr } = require('./utils');
const { devicesKeys, generateDevicesIds, generateDevicesFallbackValues } = require('./entities/device');
const { devicesFromBoaviztaNormalizeAll } = require('./adapters/boavizta');
const { devicesFromEcodiagNormalizeAll } = require('./adapters/ecodiag');
const { greenAlgorithmsCINormalizeAll } = require('./adapters/greenAlgorithms');
const { googleCloudPlatformCINormalizeAll } = require('./adapters/googleCloudPlatform');
const { co2EqKeys } = require('./entities/co2Eq');
const { co2EqNormalizeItem } = require('./adapters/datagir');
const { carbonIntensityKeys } = require('./entities/carbonIntensity');
const { commonLocationNormalization } = require('./entities/location');
const initSqlJs = require('../../../static/sql-wasm.js');

// This "data" var contains everything that will get written.
// @see static/data/ecometrics.json
const data = {};

// Data sources.
const { ecodiagDeviceList } = require('./manual-data/ecodiag.js');
const datagirJsonFile = 'private/co2-eq/equivalents.json';
const co2EqManualJsonFile = 'scripts/experiments/ecometrics/manual-data/co2-equivalents.json';
const boaviztaCsvFile = 'private/footprint-data/boavizta-data-us.csv';
const greenAlgorithmsCsvFile = 'private/footprint-data/CI_aggregated.csv';
const googleCloudPlatformCsvFile = 'private/footprint-data/GoogleCloudPlatform-region-carbon-info-2020.csv';

// Can't carry on without having downloaded the source files.
if (!fs.existsSync(boaviztaCsvFile) || !fs.existsSync(datagirJsonFile)) {
	console.log('Please run : scripts/experiments/ecometrics/fetch.sh');
	return;
}

// Load the CO2 equivalences Json files into a single array.
const co2EqRaw = [
	...JSON.parse(fs.readFileSync(datagirJsonFile).toString()),
	...JSON.parse(fs.readFileSync(co2EqManualJsonFile).toString())
];

// Load raw CSV data as arrays.
const boaviztaExtractedData = csvToArr(boaviztaCsvFile);
const greenAlgorithmsExtractedData = csvToArr(greenAlgorithmsCsvFile);
const googleCloudPlatformExtractedData = csvToArr(googleCloudPlatformCsvFile);

// Aggregate normalized data from all sources.
const { boaviztaDevices, devicesColNames } = devicesFromBoaviztaNormalizeAll(boaviztaExtractedData);
const ecodiagDevices = devicesFromEcodiagNormalizeAll(ecodiagDeviceList);
const { greenAlgorithmsCI, greenAlgorithmsCIColNames } = greenAlgorithmsCINormalizeAll(greenAlgorithmsExtractedData);
const { googleCloudPlatformCI } = googleCloudPlatformCINormalizeAll(googleCloudPlatformExtractedData);
const co2Eq = co2EqRaw.map(entry => co2EqNormalizeItem(entry));

// We'll use the data from greenAlgorithms for building our location entites.
const locations = [];
greenAlgorithmsExtractedData.forEach((line, i) => {
	if (i < 1) {
		return;
	}
	locations.push(commonLocationNormalization({
		"country_code": line[0],
		"continent": line[1],
		"country": line[2],
		"region": line[3]
	}));
});

// Debug.
// console.log(greenAlgorithmsExtractedData);
// console.log(googleCloudPlatformExtractedData);
// console.log(devicesColNames);
// console.log(boaviztaDevices[0]);
// console.log(ecodiagDevices[0]);
// console.log(co2Eq[0]);
// console.log(locations);
// return;

// Merge into a single dataset.
data.locations = locations;
data.devicesColNamesByKey = devicesColNames;
data.devices = [...boaviztaDevices, ...ecodiagDevices];
data.co2EqKeys = co2EqKeys;
data.co2Eq = co2Eq;
data.carbonIntensity = [...greenAlgorithmsCI, ...googleCloudPlatformCI];
data.carbonIntensityColNamesByKey = greenAlgorithmsCIColNames;

// We won't use the IT equipment equivalents here, as we're already measuring
// those.
const co2EqExcludedIds = ['27002', '27006', '27010'];
data.co2Eq = data.co2Eq.filter(eq => !co2EqExcludedIds.includes(eq.id));

// Assign numerical IDs to devices for selection presets shareable by URL.
generateDevicesIds(data);

// console.log('before');
// console.log(data.devices.length);

// Associate fallback values when some metrics are missing based on averages.
generateDevicesFallbackValues(data);

// console.log('after');
// console.log(data.devices.length);

// Make sure there are no more devices without a power consumption estimate :
// data.devices.forEach(device => {
// 	if (!device.yearly_kwh.length) {
// 		console.log(device);
// 	}
// 	console.log(`${device.name} : ${device.yearly_kwh}`);
// });

// Preprocess distinct values.
// data.devicesDistinctValues = {
// 	"category": [],
// 	"subcategory": []
// };
// Object.keys(data.devicesDistinctValues).forEach(key => {
// 	data.devices.forEach(device => {
// 		if (device[key].length && !data.devicesDistinctValues[key].includes(device[key])) {
// 			data.devicesDistinctValues[key].push(device[key]);
// 		}
// 	});
// });

// Debug.
// for (let i = 0; i < 20; i++) {
// 	const d = data.devices[Math.floor(Math.random() * data.devices.length)];
// 	// console.log(`${d.id} : ${Object.keys(d).length} == ${devicesKeys.length} ?`);
// 	console.log(d);
// }
// for (let i = 0; i < 20; i++) {
// 	const ci = data.carbonIntensity[Math.floor(Math.random() * data.carbonIntensity.length)];
// 	console.log(ci);
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

	// TODO props2Arr() needs to sync the correct order (ecodiag devices have
	// their columns mismatched) !
	db.run(`CREATE TABLE devices (${ devicesKeys.join(', ') });`);
	data.devices.forEach(device => db.run(
		`INSERT INTO devices VALUES (${ devicesKeys.map(c => '?').join(',') })`,
		props2Arr(device)
	));

	db.run(`CREATE TABLE devicesCols (title);`);
	props2Arr(devicesColNames).forEach(colName => db.run(
		`INSERT INTO devicesCols VALUES (?)`,
		[ colName ]
	));

	// TODO carbon intensity ?
	// Still not big enough data though, so this is not justified for now.

	// Debug.
	// console.log(data.co2EqKeys);
	// console.log(devicesKeys);
	// console.log(props2Arr(devicesColNames));
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
