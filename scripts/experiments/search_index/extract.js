/**
 * @file
 * Public URLs data miner based on channels exports.
 *
 * @see scripts/experiments/search_index/fetch.sh
 *
 * @example
 *   # From project docroot :
 *   node scripts/experiments/search_index/extract.js
 */

const fs = require('fs');
const { write_file } = require('../../fs');
const { build_channels_urls_index } = require('./lib/parsing');
const { props2Arr } = require('../ecometrics/utils');
const initSqlJs = require('../../../static/sql-wasm.js');

const data = build_channels_urls_index();

if (!data.documents.length) {
	console.log("No documents were extracted : there is nothing to do here.");
	return;
}

// For SQLite, we need consistent columns across all documents : same number of
// keys for all objects to store, and in the same order.
// -> dynamically arrange that.
let keys = [];
data.documents.forEach(doc => {
	Object.keys(doc).forEach(key => {
		if (!keys.includes(key)) {
			keys.push(key);
		}
	});
});
keys = keys.sort();

// Assign IDs for easier filtering using separate tables and joins.
keys.unshift('id');
data.tags = [];
data.has_tags = [];
data.persons = [];
data.has_persons = [];
data.reactions = [];
data.has_reactions = [];

/**
 * Only adds entry to dataset if not duplicate.
 *
 * @param {String} table name
 * @param {Object} o entity object
 * @param {Array} keys used to match previously created entitis.
 * @returns {Number} the ID of the newly created entity, or of the matching
 *   previously created entity (if any).
 */
const uniqueEntry = (table, o, keys) => {
	for (let i = 0; i < data[table].length; i++) {
		const entry = data[table][i];
		let match = '';
		let compare = '';
		keys.foreach(key => {
			match += o[key] + '.';
			compare += entry[key] + '.';
		});
		if (match == compare) {
			return entry.id;
		}
	});
	data[key].push(o);
	return 'id' in o ? o.id : true;
};

data.documents = data.documents.map((doc, i) => {
	doc.id = i;

	// Prepare "tags" filter.
	if (doc?.tags?.length) {
		const tags = doc.tags.split(',').map(name => name.trim());
		tags.forEach(name => {
			const id = uniqueEntry('tags', { id: data.tags.length, name }, ['name']);
			// data.has_tags.push({
			// 	id_tag: id,
			// 	id: doc.id,
			// 	table: 'documents'
			// });
			uniqueEntry(
				'has_tags',
				{
					id_tag: id,
					id: doc.id,
					table: 'documents'
				},
				['id_tag', 'id', 'table']
			);
		});
	}

	// Prepare "persons" filter.
	const docPersons = [];
	if (doc?.author?.length) {
		docPersons.push(doc.author);
	}
	if (doc?.names?.length) {
		docPersons = [
			...docPersons,
			...doc.names.split(',').map(name => name.trim())
		];
	}
	if (docPersons.length) {
		docPersons.forEach(name => {
			const id = uniqueEntry(
				'persons',
				{ id: data.persons.length, name },
				['name']
			);
			// data.has_persons.push({
			// 	id_person: id,
			// 	id: doc.id,
			// 	table: 'documents'
			// });
			uniqueEntry(
				'has_persons',
				{
					id_person: id,
					id: doc.id,
					table: 'documents'
				},
				['id_person', 'id', 'table']
			);
		});
	}

	// TODO prepare "reactions" filter.

	// Finally, return the normalized document object.
	const orderedObj = {};
	keys.forEach(
		key => doc[key] ? orderedObj[key] = doc[key] : orderedObj[key] = ''
	);
	return orderedObj;
});

// We'll still use a json file output, but only for a preview of the last 30
// most recent documents.
// @see src/components/content/MScSearchIndex.svelte
const last30DocsPreview = [];
for (let i = 0; i < 30; i++) {
	last30DocsPreview.push(data.documents[i]);
}

// Debug.
// console.log(keys);
// console.log(data.documents);
// return;

// Write as sqlite file.
initSqlJs().then(SQL => {
	var db = new SQL.Database();

	// TODO (wip) create and fill all filters table.
	// db.run(`CREATE TABLE tags (id, name);`);
	// data.documents.forEach(doc => {
	// 	if (doc.tags.length) {
	// 		db.run(
	// 			`INSERT INTO tags VALUES (${ keys.map(c => '?').join(',') })`,
	// 			props2Arr(doc)
	// 		)
	// 	}
	// });
	// db.run(`CREATE TABLE persons (id, name);`);
	// db.run(`CREATE TABLE reactions (id, name, nb);`);

	db.run(`CREATE TABLE documents (${ keys.join(', ') });`);
	data.documents.forEach(doc => db.run(
		`INSERT INTO documents VALUES (${ keys.map(c => '?').join(',') })`,
		props2Arr(doc)
	));

	try {
		if (fs.existsSync('static/data/search_index.sqlite')) {
			fs.unlinkSync('static/data/search_index.sqlite');
		}
		write_file(
			'static/data/search_index.sqlite',
			new Buffer.from(db.export())
		);
	} catch (error) {
		console.log(error);
	}
});

// TODO deprecate this file.
// Write as JSON file (the whole set to compare the size with the sqlite file).
try {
	write_file(
		'static/data/search_index.json',
		JSON.stringify(data)
	);
} catch (error) {
	console.log(error);
}

// Write the preview JSON file which contains the last change (unix) timestamp.
// It will be used to bust the client-side cached version of the database.
// @see src/stores/mscSearchIndex.js
// @see src/components/content/MScSearchIndex.svelte
try {
	write_file(
		'static/data/search_index_preview.json',
		JSON.stringify({
			documents: last30DocsPreview,
			total: data.documents.length,
			// This assumes contents will change on every run. If not, manually revert
			// to previous value in the generated file. TODO automate this case.
			unixTime: Math.floor(Date.now() / 1000),
			dbSize: fs.statSync('static/data/search_index.sqlite').size / 1024, // in ko
			jsonSize: fs.statSync('static/data/search_index.json').size / 1024 // in ko (TODO deprecate)
		})
	);
} catch (error) {
	console.log(error);
}
