
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
export const injectScript = src => {
	return new Promise((resolve, reject) => {
		const script = document.createElement('script');
		script.src = src;
		script.addEventListener('load', resolve);
		script.addEventListener('error', e => reject(e.error));
		document.head.appendChild(script);
	});
};

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
	if (!sqliteFileContents) {
		[SQL, buf] = await Promise.all([
			initSqlJs({ locateFile: file => `./${file}` }),
			fetch('/data/search_index.sqlite').then(res => res.arrayBuffer())
		]);
		try {
			await localforage.setItem('search_index', buf);
			console.log('sqliteFileContents have been copied locally using localforage.');
		} catch (error) {
			console.error(error);
		}
	} else {
		SQL = await initSqlJs({ locateFile: file => `./${file}` });
		buf = sqliteFileContents;
	}
	return new SQL.Database(new Uint8Array(buf));
};
