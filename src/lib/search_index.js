
/**
 * @file
 * Contains shared utilities for the "search index" experiment.
 */

import localforage from 'localforage';

/**
 * Utility to dynamically load scripts.
 *
 * See https://stackoverflow.com/a/39008859/2592338 (current approach)
 * See https://stackoverflow.com/a/45032548/2592338 (synchronous alternative)
 * See https://stackoverflow.com/a/51669062/2592338 (untested import)
 */
export const injectScript = src => new Promise((resolve, reject) => {
	const script = document.createElement('script');
	script.src = src;
	script.addEventListener('load', resolve);
	script.addEventListener('error', e => reject(e.error));
	document.head.appendChild(script);
});

/**
 * Initializes (once) the search index SQLite database.
 */
export const initDb = async forceReload => {
	let SQL = null;
	let buf = null;
	let sqliteFileContents = null;
	if (typeof initSqlJs === 'undefined') {
		await injectScript('/sql-wasm.js');
	}
	if (typeof forceReload === 'undefined') {
		try {
			sqliteFileContents = await localforage.getItem('search_index');
			if (sqliteFileContents) {
				console.log('sqliteFileContents have been loaded using localforage.');
			}
		} catch (error) {
			console.error(error);
		}
	}
	if (!sqliteFileContents || typeof forceReload !== 'undefined') {
		[SQL, buf] = await Promise.all([
			initSqlJs({ locateFile: file => `./${file}` }),
			fetch('/search_index.sqlite').then(res => res.arrayBuffer())
		]);
		try {
			await localforage.setItem('search_index', buf);
			console.log('sqliteFileContents have been downloaded and stored in your browser using localforage (indexedDB or fallback).');
		} catch (error) {
			console.error(error);
		}
	} else {
		SQL = await initSqlJs({ locateFile: file => `./${file}` });
		buf = sqliteFileContents;
	}
	return new SQL.Database(new Uint8Array(buf));
};

/**
 * TODO (wip) Returns the paginated results.
 *
 * @param {Object} db the SQL.js database instance.
 */
export const getResults = db => {
	const results = [];

	const documentKeys = [
		'id',
		'date_shared',
		'description',
		'title',
		'type',
		'type_raw',
		'url'
	];

	const stmt = db.prepare(`
		SELECT
			document.*,
			GROUP_CONCAT(tag.name, ', ') tags,
			author.name as author,
			GROUP_CONCAT(mention.name, ', ') names,
			GROUP_CONCAT(has_reaction.qty, ';') reactions_qty,
			GROUP_CONCAT(reaction.name, ';') reactions_name

		FROM document

		LEFT JOIN has_tag ON document.id = has_tag.id
			AND has_tag.db_table = $t
		LEFT JOIN tag ON has_tag.id_tag = tag.id

		LEFT JOIN has_person as has_author ON document.id = has_author.id
			AND has_author.db_table = $t
			AND has_author.type = $a
		LEFT JOIN person as author ON has_author.id_person = author.id

		LEFT JOIN has_person as has_mention ON document.id = has_mention.id
			AND has_mention.db_table = $t
			AND has_mention.type = $n
		LEFT JOIN person as mention ON has_mention.id_person = mention.id

		LEFT JOIN has_reaction ON document.id = has_reaction.id
			AND has_reaction.db_table = $t
		LEFT JOIN reaction ON has_reaction.id_reaction = reaction.id

		GROUP BY document.id
		ORDER BY document.id DESC

		LIMIT 0,30
	`);

	stmt.bind({
		$t: 'document',
		$a: 'author',
		$n: 'mention'
	});

	let failsafe = 999;
	while (failsafe && stmt.step()) {
		const row = stmt.getAsObject();

		// Convert GROUP_CONCAT'ed ";"-separated values in expected format.
		// @see src/components/experiments/MScSearchIndexResults.svelte
		if (row.reactions_name && row.reactions_qty) {
			row.reactions = [];
			row.reactions_qty = row.reactions_qty.split(';');
			row.reactions_name.split(';').forEach((name, i) => {
				row.reactions.push({ name, count: row.reactions_qty[i] });
			});
		}

		results.push(row);
		failsafe--;
	}

	stmt.free();
	return results;
};
