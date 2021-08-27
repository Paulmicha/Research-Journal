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
const {
	devicesKeys,
	devicesFromBoaviztaNormalizeAll,
	devicesFromEcodiagNormalizeAll,
	generateDevicesIds,
	generateDevicesFallbackValues,
	co2EqKeys,
	co2EqNormalizeItem,
	carbonIntensityKeys,
	greenAlgorithmsCINormalizeAll,
	googleCloudPlatformCINormalizeAll
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

/**
 * Converts given CSV file path to an array of arrays (lines x columns).
 *
 * @param {String} csvFile : CSV file path.
 * @param {String} separator : [optional] character delimiting columns. Defaults
 *  to ','.
 * @returns {Array} array of arrays (lines x columns).
 */
const csvToArr = (csvFile, separator = ',') => fs.readFileSync(csvFile)
	.toString() // convert Buffer to string
	.split('\n') // split string to lines
	.map(e => e.trim()) // remove white spaces for each line
	.map(e => e
		.split(separator) // split each line to array
		.map(e => e.trim()) // remove white spaces for each column
	)
	.filter(e => e != null && e != ''); // remove empty lines

// Data sources.
const { ecodiagDeviceList } = require('./ecodiag/devices.js');
const datagirJsonFile = 'private/co2-eq/equivalents.json';
const boaviztaCsvFile = 'private/footprint-data/boavizta-data-us.csv';
const greenAlgorithmsCsvFile = 'private/footprint-data/CI_aggregated.csv';
const googleCloudPlatformCsvFile = 'private/footprint-data/GoogleCloudPlatform-region-carbon-info-2020.csv';

// Can't carry on without having downloaded the source files.
if (!fs.existsSync(boaviztaCsvFile) || !fs.existsSync(datagirJsonFile)) {
	console.log('Please run : scripts/experiments/ecometrics/fetch.sh');
	return;
}

// Load the CO2 equivalences Json file as array.
const co2EqRaw = JSON.parse(fs.readFileSync(datagirJsonFile).toString());

// Manually include average Netflix emissions.
// See https://www.carbonbrief.org/factcheck-what-is-the-carbon-footprint-of-streaming-video-on-netflix
co2EqRaw.push({
	"id": 12345,
	"name": {
		"fr": "h sur Netflix"
	},
	"emoji": "📺",
	"total": 0.036,
	"default": true,
	"defaultEmbed": true,
	"about": "Powered by the global average electricity mix, streaming a 30-minute show on Netflix in 2019 released around 0.018kgCO2e (<a href='https://www.carbonbrief.org/factcheck-what-is-the-carbon-footprint-of-streaming-video-on-netflix'>source</a>)"
});

// Manually include the tree-month unit.
// See https://onlinelibrary.wiley.com/doi/10.1002/advs.202100707 (http://green-algorithms.org/)
co2EqRaw.push({
	"id": 12346,
	"name": {
		"fr": "tree-month"
	},
	"emoji": "🌳",
	"total": 0.92,
	"default": true,
	"defaultEmbed": true,
	"about": "This represents the number of months a mature tree needs to absorb a given quantity of CO2. While the amount of CO2 sequestered by a tree per unit of time depends on a number of factors, such as its species, size, or environment, it was estimated that a mature tree sequesters, on average, ≈11 kg of CO2 per year, giving the multiplier in tree-months a value close to 1 kg of CO2 per month (0.92 kg). (<a href='https://onlinelibrary.wiley.com/doi/10.1002/advs.202100707'>source</a>)"
});

// Aggregate normalized data from all sources.
const data = {};
const boaviztaExtractedData = csvToArr(boaviztaCsvFile);
const { boaviztaDevices, devicesColNames } = devicesFromBoaviztaNormalizeAll(boaviztaExtractedData);
const ecodiagDevices = devicesFromEcodiagNormalizeAll(ecodiagDeviceList);
const greenAlgorithmsExtractedData = csvToArr(greenAlgorithmsCsvFile);
const { greenAlgorithmsCI, greenAlgorithmsCIColNames } = greenAlgorithmsCINormalizeAll(greenAlgorithmsExtractedData);
const googleCloudPlatformExtractedData = csvToArr(googleCloudPlatformCsvFile);
const { googleCloudPlatformCI } = googleCloudPlatformCINormalizeAll(googleCloudPlatformExtractedData);
const co2Eq = co2EqRaw.map(entry => co2EqNormalizeItem(entry));

// Debug.
// console.log(greenAlgorithmsExtractedData);
// console.log(googleCloudPlatformExtractedData);
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
data.carbonIntensity = [...greenAlgorithmsCI, ...googleCloudPlatformCI];
data.carbonIntensityKeys = carbonIntensityKeys;
data.carbonIntensityColNames = props2Arr(greenAlgorithmsCIColNames);
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

	// TODO carbon intensity ?
	// Still not big enough data though, so this is not justified for now.

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
