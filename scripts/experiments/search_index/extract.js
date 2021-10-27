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

import * as fs from 'fs';
import { writeFile } from '../../fs.js';
import { build_channels_urls_index } from './lib/parsing.js';
import { props2Arr } from '../ecometrics/utils.js';
import { uniqueEntry, createTableQuery } from './utils.js';
import initSqlJs from 'sql.js';

const data = build_channels_urls_index();

if (!data.documents.length) {
	console.log("No documents were extracted : there is nothing to do here.");
	throw "exit early";
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

// Assign IDs for easier filtering using separate tables and joins. Remove the
// keys that would contain data moved to separate tables.
keys.unshift('id');
keys = keys.filter(key => !['tags', 'reactions', 'author', 'names'].includes(key));

data.tag = [];
data.has_tag = [];
data.person = [];
data.has_person = [];
data.reaction = [];
data.has_reaction = [];
data.preview = [];

// We'll still use a json file output, but only for a preview of the most recent
// documents (taking the last 150).
// @see src/components/content/MScSearchIndex.svelte
for (let i = 0; i < 150; i++) {
	data.preview.push(data.documents[i]);
}

data.documents = data.documents.map((doc, i) => {
	// The documents are ordered from the most recent to the older -> primary key
	// increment should start from the older.
	doc.id = data.documents.length - i;

	// Prepare "tags" filter.
	if (doc?.tags?.length) {
		const tags = doc.tags.split(',').map(name => name.trim());
		tags.forEach(name => {
			const id = uniqueEntry(data, 'tag', { id: data.tag.length + 1, name }, ['name']);
			uniqueEntry(
				data,
				'has_tag',
				{
					id_tag: id,
					id_origin: doc.id,
					db_table: 'document'
				},
				['id_tag', 'id_origin', 'db_table']
			);
		});
	}

	// Prepare "persons" filter (2 types of relation : 'author' and 'mention').
	if (doc?.author?.length) {
		const id = uniqueEntry(
			data,
			'person',
			{ id: data.person.length + 1, name: doc.author },
			['name']
		);
		uniqueEntry(
			data,
			'has_person',
			{
				id_person: id,
				id_origin: doc.id,
				db_table: 'document',
				type: 'author'
			},
			['id_person', 'id_origin', 'db_table']
		);
	}
	if (doc?.names?.length) {
		doc.names.split(',').map(name => name.trim()).forEach(name => {
			const id = uniqueEntry(
				data,
				'person',
				{ id: data.person.length + 1, name },
				['name']
			);
			uniqueEntry(
				data,
				'has_person',
				{
					id_person: id,
					id_origin: doc.id,
					db_table: 'document',
					type: 'mention'
				},
				['id_person', 'id_origin', 'db_table']
			);
		});
	}

	// Prepare "reactions" filter.
	if (doc.reactions?.length) {
		doc.reactions.forEach(reaction => {
			const id = uniqueEntry(
				data,
				'reaction',
				{ id: data.reaction.length + 1, name: reaction.name },
				['name']
			);
			data.has_reaction.push({
				id_reaction: id,
				id_origin: doc.id,
				db_table: 'document'
			});
		});
	}

	// Finally, return the normalized document object.
	const orderedObj = {};
	keys.forEach(
		key => doc[key] ? orderedObj[key] = doc[key] : orderedObj[key] = ''
	);
	return orderedObj;
});

// Debug.
// console.log(keys);
// console.log(data.documents);
// console.log(data);
// return;

// Write as sqlite file.
initSqlJs().then(SQL => {
	var db = new SQL.Database();

	db.run(createTableQuery('document', keys));
	db.run(createTableQuery('tag', ['id', 'name']));
	db.run(createTableQuery('has_tag', ['id_tag', 'id_origin', 'db_table']));
	db.run(createTableQuery('person', ['id', 'name']));
	db.run(createTableQuery('has_person', ['id_person', 'id_origin', 'db_table', 'type']));
	db.run(createTableQuery('reaction', ['id', 'name']));
	db.run(createTableQuery('has_reaction', ['id_reaction', 'id_origin', 'db_table']));

	const allAtOnce = ['tag', 'person', 'reaction'];
	allAtOnce.forEach(t => {
		data[t].forEach(o => db.run(
			`INSERT INTO ${t} VALUES (${ Object.keys(o).map(c => '?').join(',') })`,
			props2Arr(o)
		));
		data['has_' + t].forEach(o => db.run(
			`INSERT INTO has_${t} VALUES (${ Object.keys(o).map(c => '?').join(',') })`,
			props2Arr(o)
		));
	});

	data.documents.forEach(doc => db.run(
		`INSERT INTO document VALUES (${ keys.map(c => '?').join(',') })`,
		props2Arr(doc)
	));

	try {
		if (fs.existsSync('static/search_index.sqlite')) {
			fs.unlinkSync('static/search_index.sqlite');
		}
		writeFile(
			'static/search_index.sqlite',
			new Buffer.from(db.export())
		);
	} catch (error) {
		console.log(error);
	}
});

// Write the preview JSON file which contains the last change (unix) timestamp.
// It will be used to bust the client-side cached version of the database.
// @see src/stores/mscSearchIndex.js
// @see src/components/content/MScSearchIndex.svelte
try {
	writeFile(
		'content/search_index_preview.json',
		JSON.stringify({
			documents: data.preview,
			total: data.documents.length,
			// This assumes contents will change on every run. If not, manually revert
			// to previous value in the generated file. TODO automate this case.
			unixTime: Math.floor(Date.now() / 1000),
			dbSize: fs.statSync('static/search_index.sqlite').size / 1024 // in ko
		})
	);
} catch (error) {
	console.log(error);
}
