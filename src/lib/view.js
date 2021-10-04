
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
		total_results_nb: 0,
		// These rendering-specific state values are stored together here because
		// otherwise it would complicate keeping the pager component "in sync".
		// @see src/lib/components/ViewPager.svelte
		prev: -1,
		prev_is_disabled: true,
		next: 1,
		next_is_disabled: false,
	};
	if ('pager' in definition) {
		pagerState = { ...pagerState, ...definition.pager };
	}
	return pagerState;
};

/**
 * Re-calculates pager state.
 *
 * @param {Object} view the view object.
 * @param {Integer} n the new page number.
 */
export const updateViewPagerState = (view, n) => {
	view.pager.current_page = n;
	view.pager.prev = -1;
	view.pager.prev_is_disabled = false;
	view.pager.next = 1;
	view.pager.next_is_disabled = false;
	if (n > 0) {
		view.pager.prev = n - 1;
		view.pager.next = n + 1;
	}
	if (view.pager.prev < 0) {
		view.pager.prev_is_disabled = true;
		view.pager.prev = 0;
	}
	if (view.pager.next > view.pager.last_page) {
		view.pager.next_is_disabled = true;
		view.pager.next = n;
	}
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
		if ('sort_active' in view.fields[field]) {
			const by = 'sort_on' in view.fields[field]
				? view.fields[field].sort_on
				: f;
			const dir = 'sort_dir' in view.fields[field]
				? view.fields[field].sort_dir
				: 'ASC';
			// Preserve original sorting as fallback in case of multiple "sort"
			// statements.
			if (sort.length) {
				sort = `${by} ${dir}, ${sort}`;
			}
			else {
				sort = `${by} ${dir}`;
			}
		}

		// 3. "field" filters (conditions).
		if (
			view.filters
			&& field in view.filters
			&& view.filters[field].type === 'field'
			&& 'value' in view.filters[field]
		) {
			if (filter.length) {
				// TODO [evol] combinations ? OR ?
				filter += " AND ";
			}

			let placeholder = '$' + f.replace('.', '_');
			let op = view.filters[field]?.op || '=';
			let val = view.filters[field].value;

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
				// 	filter += f + ' > ' + placeholder + ' AND ' + f + ' < ' + placeholder2;
				// 	break;
			}

			queryArgs[placeholder] = val;
		}
	});

	let select = selectArr.join(', ');
	if (view.distinct) {
		select = "DISTINCT " + select;
	}

	// Assembling the final SQL query string.
	let query = '';
	query += `SELECT ${select} \nFROM ${view.base_table}`;

	// We're using "joins" entry as an object keyed by joined tables to facilitate
	// applying filters (see above), but leave the possibility to just use "join"
	// for plain string input.
	if (view?.joins) {
		Object.keys(view.joins).forEach(joinedTable => {
			if (
				view.filters
				&& joinedTable in view.filters
				&& view.filters[joinedTable].type === 'swap join'
				&& 'value' in view.filters[joinedTable]
			) {
				// TODO use query args instead.
				if (view.filters[joinedTable].placeholder) {
					query += "\n" + view.filters[joinedTable].query.replace(
						view.filters[joinedTable].placeholder,
						view.filters[joinedTable].value
					);
				} else {
					query += "\n" + view.filters[joinedTable].query;
				}
			} else {
				query += "\n" + view.joins[joinedTable];
			}
		});
	} else if (view?.join) {
		query += "\n" + view.join;
	}

	// Some filters may require adding new "join" statements to the query.
	if (view.filters) {
		Object.keys(view.filters).forEach(f => {
			if (view.filters[f].type === 'new join' && 'value' in view.filters[f]) {
				// TODO use query args instead.
				if ('placeholder' in view.filters[f]) {
					query += "\n" + view.filters[f].query.replace(
						view.filters[f].placeholder,
						view.filters[f].value
					);
				} else {
					query += "\n" + view.filters[f].query;
				}
			}
		});
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

	// TODO (wip) apply only for JOIN queries ?
	// See https://stackoverflow.com/a/12123132/2592338
	let countQuery = 'count_query' in view ? view.count_query : '';
	if (!countQuery.length) {
		// countQuery = query.replace(
		// 	`SELECT ${select}`,
		// 	`SELECT COUNT(*) as count`
		// 	// `SELECT COUNT(DISTINCT ${view.base_table}.id) as count`
		// );
		countQuery = query.replace(`SELECT ${select} \nFROM ${view.base_table}`, '');
		countQuery = `
			SELECT sum(Total) AS totalOfRows
			FROM (
				SELECT 1 as Total
				FROM ${view.base_table}
				${countQuery}
			)
		`;
	}

	// Pager limit.
	const limitStart = view.pager.current_page * view.pager.nb_per_page;
	query += "\nLIMIT " + `${limitStart}, ${view.pager.nb_per_page}`;

	// Debug.
	// query = query.split("\n").map(s => s.trim()).filter(s => s.length).join("\n");
	// console.log(query);

	return { query, queryArgs, countQuery };
};

/**
 * Updates view results (applies pager and filters' state).
 *
 * This function alters the view object directly. It does not attempt to
 * determine if its state changed before making the query (-> caller's
 * responsability).
 *
 * @param {Object} view the view object.
 * @param {Boolean} rebuildPager forces pager state update (e.g. if filters
 *   change - not if we just load next page of the same result set).
 */
export const updateViewResults = (view, rebuildPager = false) => {
	if (!view?.db) {
		return false;
	}
	if (rebuildPager) {
		view.pager.current_page = 0;
	}
	const { query, queryArgs, countQuery } = viewQueryBuilder(view);
	view.results = dbFetchAll(view.db, query, queryArgs);
	if (!view.pager.total_results_nb || rebuildPager) {
		view.pager.total_results_nb = dbPopFetch(view.db, countQuery, queryArgs);
		view.pager.last_page = Math.floor(
			view.pager.total_results_nb / view.pager.nb_per_page
		);
		updateViewPagerState(view, 0);
	}
};

/**
 * Updates the filters' options.
 *
 * TODO adapt options based on active filters ?
 * TODO async options' fuzzy search for bigger lists ?
 *
 * @param {Object} view the view definition object.
 */
export const updateViewFiltersValues = view => {
	Object.keys(view.filters).forEach(f => {
		// Each "select" filter needs options. It assumes a DB table is associated
		// to each filter for fetching the list of options (unless a values_query
		// is specified).
		if (view.filters[f]?.select) {
			if (!view.filters[f].table?.length) {
				view.filters[f].table = f;
			}
			if ('values_query' in view.filters[f]) {
				view.filters[f].options = dbFetchAll(
					view.db,
					view.filters[f].values_query,
					view.filters[f]?.values_query_args
				);
			} else {
				// If no query is specified, fallback to a basic "fetch all" (within
				// limits).
				let max = 2500;
				if ('values_query_max' in view.filters[f]) {
					max = view.filters[f].values_query_max;
				}
				if (!max) {
					view.filters[f].options = dbFetchAll(
						view.db,
						`SELECT * FROM ${view.filters[f].table}`
					);
				} else {
					view.filters[f].options = dbFetchAll(
						view.db,
						`SELECT * FROM ${view.filters[f].table} LIMIT 0, ${max}`
					);
				}
			}
		}
	});
	return view;
};

/**
 * Initializes given view object.
 *
 * This will fetch initial results and filter options.
 *
 * @param {Object} view the view definition object.
 * @returns {Object} the initialized view object.
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
	// Default results.
	if (!view?.results?.length) {
		updateViewResults(view);
	}
	// Populate the initial filter options;
	updateViewFiltersValues(view);
	return view;
};

/**
 * Applies the new currently active page number.
 *
 * @param {Object} view the view object.
 * @param {Integer} n the new page number.
 */
export const paginateView = (view, n) => {
	updateViewPagerState(view, n);
	updateViewResults(view);
};

/**
 * Applies or clears filters.
 *
 * @param {Object} view the view object.
 * @param {String} f the filter "name" (can be a DB table name).
 * @param {Array} value [optional] input value(s) or selected options. If
 *   undefined, it will clear the filter.
 */
export const filterView = (view, f, value) => {
	if (
		(typeof value === 'undefined')
		&& 'value' in view.filters[f]
	) {
		// Clear filter.
		delete view.filters[f].value;
	} else if (
		'value' in view.filters[f]
		&& JSON.stringify(view.filters[f].value) === JSON.stringify(value)
	) {
		// Update is not needed.
		return;
	} else {
		// Filter value is new or has changed.
		view.filters[f].value = value;
	}
	// Filtering or clearing filters will impact the pager -> reset current page.
	updateViewResults(view, true);
};

/**
 * Sorts the view by given field.
 *
 * @param {Object} view the view object.
 * @param {String} sortBy the field name (table name or alias) to sort on.
 * @param {String} dir either "ASC" or "DESC".
 */
export const sortView = (view, sortBy, dir) => {
	Object.keys(view.fields).forEach(f => {
		if ('sort_active' in view.fields[f]) {
			delete view.fields[f].sort_active;
		}
	});
	view.fields[sortBy].sort_dir = dir;
	view.fields[sortBy].sort_active = true;
	updateViewPagerState(view, 0);
	updateViewResults(view);
};
