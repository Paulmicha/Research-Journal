
/**
 * @file
 * Contains shared utilities for the "search index" experiment.
 */

import localforage from 'localforage';

/**
 * Utility to fetch new scripts in the browser.
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
 * Initializes (once) given SQLite database.
 *
 * @param {String} dbName the sqlite file name (without extension) in /static.
 * @param {Boolean} forceReload [optional] true to force re-fetching even when
 *   previously cached.
 * @returns {Object} sql-wasm.js's SQL.Database instance.
 */
export const initDb = async (dbName, forceReload) => {
	let SQL = null;
	let buf = null;
	let sqliteFileContents = null;
	if (typeof initSqlJs === 'undefined') {
		await injectScript('/sql-wasm.js');
	}
	if (typeof forceReload === 'undefined') {
		try {
			sqliteFileContents = await localforage.getItem(dbName);
			if (sqliteFileContents) {
				console.log(dbName + ' sqliteFileContents have been loaded using localforage.');
				console.log('See https://github.com/localForage/localForage');
			}
		} catch (error) {
			console.error(error);
		}
	}
	if (!sqliteFileContents || typeof forceReload !== 'undefined') {
		[SQL, buf] = await Promise.all([
			initSqlJs({ locateFile: file => `./${file}` }),
			fetch('/' + dbName + '.sqlite').then(res => res.arrayBuffer())
		]);
		try {
			await localforage.setItem(dbName, buf);
			console.log(dbName + 'sqliteFileContents have been downloaded and stored in your browser using localforage (indexedDB or fallback).');
			console.log('See https://github.com/localForage/localForage');
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
 * Returns all results as array of objects keyed by column.
 *
 * @param {Object} db sql-wasm.js's SQL.Database instance.
 * @param {String} query the SQL query.
 * @param {Object} queryArgs [optional] the SQL query parameters ("bind").
 *   defaults to {}.
 * @param {Integer} maxRows [optional] limit the maximum number of rows returned.
 *   Defaults to 10000.
 * @returns {Array} of objects keyed by column.
 */
export const dbFetchAll = (db, query, queryArgs = {}, maxRows = 10000) => {
	const results = [];
	const stmt = db.prepare(query);
	stmt.bind(queryArgs);
	let failsafe = maxRows;
	while (failsafe && stmt.step()) {
		const row = stmt.getAsObject();
		results.push(row);
		failsafe--;
	}
	stmt.free();
	return results;
};
