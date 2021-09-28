
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
				console.log('See https://github.com/localForage/localForage');
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
 * Returns filters.
 *
 * TODO (evol) this does not scale.
 * See https://github.com/rob-balfre/svelte-select/issues/249
 *
 * TODO (wip) assumes all filters are joined tables with entries having IDs.
 *
 * @param {Object} db the SQL.js database instance.
 * @param {String} table the DB table name.
 * @returns {Array} of objects keyed by columns of given table.
 */
export const getFilterValues = (db, table) => {
	const results = [];
	const stmt = db.prepare(`
		SELECT *
		FROM ${table}
		ORDER BY id DESC
		LIMIT 0,999
	`);
	stmt.bind();
	let failsafe = 999;
	while (failsafe && stmt.step()) {
		const row = stmt.getAsObject();
		results.push(row);
		failsafe--;
	}
	stmt.free();
	return results;
};

/**
 * TODO (wip) Returns the results SQL query (without pagers).
 *
 * @param {Object} { filters, select, orderBy } options where :
 *   - select is a string,
 *   - orderBy is a string,
 *   - filters is an Array of objects like :
 *     {
 *       table: 'tag',
 *       ids: [1, 2, 3],
 *     }
 * @param {String} selectOverride [optional] replaces the default SELECT stmt.
 * @returns {Object} like :
 *   {
 *     query: "< the SQL query (without the LIMIT statement) >",
 *     bind: {
 *       $t: 'document',
 *       $a: 'author',
 *       $n: 'mention'
 *     }
 *   }
 */
export const getResultsQuery = ({ filters, select, orderBy }) => {
	// TODO this assumes all filters are joined tables with entries having IDs.
	const queryFiltersVariations = {
		"tag": {
			"type": "LEFT",
			"constraint": ""
		},
		"reaction": {
			"type": "LEFT",
			"constraint": ""
		}
	};
	let personsFiltersQueryVariation = '';
	if (filters && filters.length) {
		filters.forEach(f => {
			if (f.table === 'person') {
				personsFiltersQueryVariation = `
					INNER JOIN has_${f.table} ON document.id = has_${f.table}.id
						AND has_${f.table}.db_table = $t
						AND has_${f.table}.id_${f.table} IN (${f.ids.join(',')})
					LEFT JOIN ${f.table} ON has_${f.table}.id_${f.table} = ${f.table}.id
				`;
			} else {
				queryFiltersVariations[f.table].type = "INNER";
				queryFiltersVariations[f.table].constraint = `AND has_${f.table}.id_${f.table} IN (${f.ids.join(',')})`;
			}
		});
	}

	// TODO wrong concats (reactions counts are wrong + tag/person names repeat).
	// -> use sub queries ? do multiple queries ?
	// E.g. something like :

	// SELECT
	// 	users.user_id,
	// 	COALESCE(post_count, 0) AS post_count,
	// 	COALESCE(page_count, 0) AS page_count
	// FROM users
	// LEFT JOIN (
	// 	SELECT user_id, COUNT(*) AS post_count
	// 	FROM posts
	// 	GROUP BY user_id
	// ) post_counts ON post_counts.user_id = users.user_id
	// LEFT JOIN (
	// 	SELECT user_id, COUNT(*) AS page_count
	// 	FROM pages
	// 	GROUP BY user_id
	// ) page_counts ON page_counts.user_id = users.user_id

	// See https://mattmazur.com/2017/11/01/counting-in-mysql-when-joins-are-involved/

	let selectQueryVariation = `
		document.*,
		GROUP_CONCAT(tag.name, ', ') tags,
		author.name as author,
		GROUP_CONCAT(mention.name, ', ') names,
		GROUP_CONCAT(has_reaction.qty, ';') reactions_qty,
		GROUP_CONCAT(reaction.name, ';') reactions_name
	`;
	if (select && select.length) {
		selectQueryVariation = select;
	}

	let orderQueryVariation = "document.id DESC";
	if (orderBy && orderBy.length) {
		orderQueryVariation = orderBy;
	}

	return {
		query: `
			SELECT ${selectQueryVariation}

			FROM document

			${queryFiltersVariations.tag.type} JOIN has_tag ON document.id = has_tag.id
				AND has_tag.db_table = $t
				${queryFiltersVariations.tag.constraint}
			LEFT JOIN tag ON has_tag.id_tag = tag.id

			${personsFiltersQueryVariation}

			LEFT JOIN has_person as has_author ON document.id = has_author.id
				AND has_author.db_table = $t
				AND has_author.type = $a
			LEFT JOIN person as author ON has_author.id_person = author.id

			LEFT JOIN has_person as has_mention ON document.id = has_mention.id
				AND has_mention.db_table = $t
				AND has_mention.type = $n
			LEFT JOIN person as mention ON has_mention.id_person = mention.id

			${queryFiltersVariations.reaction.type} JOIN has_reaction ON document.id = has_reaction.id
				AND has_reaction.db_table = $t
				${queryFiltersVariations.reaction.constraint}
			LEFT JOIN reaction ON has_reaction.id_reaction = reaction.id

			GROUP BY document.id
			ORDER BY ${orderQueryVariation}
		`,
		bind: {
			$t: 'document',
			$a: 'author',
			$n: 'mention'
		}
	};
};

/**
 * TODO (wip) Returns the total number of results (with optional filters).
 *
 * @param {Object} db the SQL.js database instance.
 * @param {Object} { filters, select, orderBy } options where :
 *   - select is a string,
 *   - orderBy is a string,
 *   - filters is an Array of objects like :
 *     {
 *       table: 'tag',
 *       ids: [1, 2, 3],
 *     }
 * @returns {Number} the total number of results.
 */
export const getResultsCount = (db, options) => {
	let total = 0;
	// TODO still haven't found a correct COUNT() query -> workaround : count
	// unpaginated results (selecting only document ID).
	const { query, bind } = getResultsQuery(options || { select: 'document.id' });
	const res = db.exec(`${query}`, bind);
	if (res.length) {
		total = res[0].values.length;
	}
	return total;
};

/**
 * TODO (wip) Returns the paginated results.
 *
 * @param {Object} db the SQL.js database instance.
 * @param {Object} { filters, select, orderBy } options where :
 *   - select is a string,
 *   - orderBy is a string,
 *   - filters is an Array of objects like :
 *     {
 *       table: 'tag',
 *       ids: [1, 2, 3],
 *     }
 * @returns {Array} of objects keyed by columns of given table.
 */
export const getResults = (db, options = {}) => {
	const results = [];
	const { query, bind } = getResultsQuery(options);

	// TODO sync pagers + filters with URL query args.
	// TODO implement pagers.
	const stmt = db.prepare(`${query} LIMIT 0,30`);
	stmt.bind(bind);

	let failsafe = 999;
	while (failsafe && stmt.step()) {
		const row = stmt.getAsObject();

		// TODO concats are wrong :
		// @see getResultsQuery()
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
