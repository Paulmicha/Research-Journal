
/**
 * @file
 * Minimal "data table" (view) shared utilities.
 *
 * Spaghetti programming for now. Might decide on final implementation when the
 * basic prototype is done, perhaps classic OOP or something else.
 *
 * Existing implementations seem overkill for our use case (or outdated).
 * See https://github.com/carbon-design-system/carbon-components-svelte/blob/master/src/DataTable/DataTable.svelte
 * See https://github.com/hperrin/svelte-material-ui/blob/master/packages/data-table/DataTable.svelte
 * See https://github.com/bsssshhhhhhh/svelte-data-grid/issues
 */

import { initDb, dbFetchAll, dbPopFetch } from '$lib/sqlite';

/**
 * Returns view pager state (object).
 *
 * @see src/lib/components/Pager.svelte
 */
export const getViewPagerState = (definition = {}) => {
	let pagerState = {
		nb_per_page: 15,
		current_page: 0,
		last_page: 0,
		total_results_nb: 0
	};
	if ('pager' in definition) {
		pagerState = { ...pagerState, ...definition.pager };
	}
	return pagerState;
};

/**
 * Returns a single view definition (object).
 */
export const createView = (definition = {}) => {
	const defaults = {
		// TODO this function is called many times as we navigate back and forth
		// to wherever views are displayed, even for the same view. For now I found
		// no way to automatically bind the same view to its pagers, e.g.
		// auto-incrementing a memoized variable in certain conditions won't cut it.
		// -> Workaround : manually set unique numbers for every view across the
		// entire app...
		// @see src/lib/components/search_index/MScSearchIndexView.svelte
		id: 0,
		db_name: '',
		base_table: '',
		distinct: false,
		fields: {},
		join: '',
		sort: '',
		filters: [],
		results: []
	};
	defaults.pager = getViewPagerState(definition);
	return { ...defaults, ...definition };
};

/**
 * Initializes given view object.
 *
 * This will fetch initial results.
 *
 * @param {Object} view the view definition object.
 */
export const initView = async view => {
	// Fields must default to view's "base_table" for rendering purposes.
	// @see src/lib/components/ViewResults.svelte
	if (view?.fields && view?.base_table?.length) {
		Object.keys(view.fields).forEach(f => {
			if (!view.fields[f]?.table?.length) {
				view.fields[f].table = view.base_table;
			}
		});
	}
	// Binds the view to a database instance (TODO separate those concerns ?)
	if (!view?.db && view?.db_name?.length) {
		view.db = await initDb(view.db_name);
	}
	// Default results (while we're at it).
	if (!view?.results?.length && view?.db) {
		const { query, queryArgs } = viewQueryBuilder(view);
		view.results = dbFetchAll(view.db, query, queryArgs);
		view.pager.total_results_nb = dbPopFetch(
			view.db,
			`SELECT COUNT(*) FROM ${view.base_table}`
		);
		view.pager.last_page = Math.floor(
			view.pager.total_results_nb / view.pager.nb_per_page
		);
	}
	return view;
}

/**
 * Returns SQLite query given view state.
 */
export const viewQueryBuilder = view => {
	let sort = '';
	let filter = '';
	const selectArr = [];
	const queryArgs = view?.queryArgs || {};
	const fieldNames = Object.keys(view.fields);

	fieldNames.forEach(field => {
		// Ignore "computed fields" (used for rendering purposes, not querying).
    if (field.substring(0, 1) === '#') {
      return;
    }

		// 1. Select (also determines the field "unique" name for this view, even
		// for an identical field name in different tables - which must use 'as').
		// This "f" variable is reused below for queryArgs substitutions.
		let f = field;
		if (view.fields[field]?.select) {
			selectArr.push(view.fields[field].select);
		} else {
			if (view.fields[field]?.table) {
				f = view.fields[field].table + '.' + field;
			}
			if (view.fields[field]?.as) {
				selectArr.push(f + " AS " + view.fields[field].as);
				f = view.fields[field].as;
			} else {
				selectArr.push(f);
			}
		}

		// 2. Sorting (order).
		if (view.fields[field].sort?.length) {
			// Preserve original sorting as fallback in case of equality.
			if (sort.length) {
				sort = `${f} ${view.fields[field].sort}, ${sort}`;
			}
			else {
				sort = `${f} ${view.fields[field].sort}`;
			}
		}

		// 3. Filters (conditions).
		if (view.filters && field in view.filters) {
			if (filter.length) {
				// TODO [evol] combinations ? OR ?
				filter += " AND ";
			}

			// Defaults.
			let placeholder = '$' + f.replace('.', '_');
			let op = '=';
			let val = filters[field];

			if (Array.isArray(filters[field])) {
				op = filters[field][0];
				val = filters[field][1];
			} else if (typeof filters[field] === 'object') {
				op = filters[field].op;
				val = filters[field].val;
			}

			switch (op) {
				case 'contains':
					filter += f + ' LIKE ' + placeholder;
					val = "%" + val + "%";
					break;
				case 'starts-with':
					filter += f + ' LIKE ' + placeholder;
					val = "%" + val;
					break;
				case 'ends with':
					filter += f + ' LIKE ' + placeholder;
					val = val + "%";
					break;
				case 'min':
					filter += f + ' > ' + placeholder;
					break;
				case 'max':
					filter += f + ' < ' + placeholder;
					break;
				// TODO handle the 2nd value.
				// case 'between':
				//   filter += f + ' > ? AND ' . $f . ' < ' + placeholder;
				//   break;
			}

			queryArgs[placeholder] = val;
		}
	});

	let select = selectArr.join(', ');
	if (view.distinct) {
		select = "DISTINCT " + select;
	}

	let query = '';
	query += `SELECT ${select} FROM ${view.base_table}`;
	if (view?.join?.length) {
		query += "\n" + view.join;
	}
	if (filter.length) {
		query += "\n" + "WHERE " + filter;
	}
	if (view.group_by?.length) {
		query += "\n" + "GROUP BY " + view.group_by;
	}
	if (sort.length) {
		query += "\n" + "ORDER BY " + sort;
	}

	let countQuery = '';
	if (view?.distinct) {
		countQuery = query.replace(
			`SELECT ${select} FROM ${view.base_table}`,
			`SELECT COUNT(${select}) as count FROM ${view.base_table}`
		);
	}

	// Pager limit.
	const limitStart = view.pager.current_page * view.pager.nb_per_page;
	query += "\nLIMIT " + `${limitStart}, ${view.pager.nb_per_page}`;

	// Debug.
	// console.log(query);

	return { query, queryArgs, countQuery };
};
