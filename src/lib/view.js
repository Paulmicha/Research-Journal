
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

let staticViewCount = 0;

/**
 * "Static" unique view counter.
 *
 * Used to facilitate wiring views pagers and filters.
 */
export const getViewId = (returnLast = false) => {
	if (!returnLast) {
		staticViewCount++;
	}
	return staticViewCount;
};

/**
 * Returns view pager state (object).
 *
 * @see src/lib/components/Pager.svelte
 */
export const getViewPagerState = (view, options = {}) => {
	let pagerState = {
		view_id: !('view_id' in options)
			? getViewId(true)
			: null,
		nb_per_page: 15,
		current_page: 0,
		last_page: 0,
		total_results_nb: 0
	};
	if ('pager' in options) {
		pagerState = { ...pagerState, ...options.pager };
	}
	return pagerState;
};

/**
 * Returns a single view definition (object).
 */
export const createView = (options = {}) => {
	const defaults = {
		view_id: !('view_id' in options)
			? getViewId()
			: null,
		base_table: null,
		distinct: false,
		fields: {},
		join: null,
		sort: 'base_table' in options
			? `id_${options.base_table} DESC`
			: null
	};
	defaults.pager = getViewPagerState(defaults, options);
	return { ...defaults, ...options };
};

/**
 * Returns SQLite query given view state.
 */
export const viewQueryBuilder = (view, state = {}) => {
	let sort = '';
	let filter = '';
	const selectArr = [];
	const queryArgs = {};
	const { sorts, filters } = state;
	const fieldNames = Object.keys(view.fields);

	fieldNames.forEach(field => {
		// Ignore "computed fields" (used for rendering purposes, not querying).
    if (field.substring(0, 1) === '#') {
      return;
    }

		// 1. Select (also determines the field "unique" name for this view, even
		// for an identical field name in different tables - which must use 'as').
		let f = view.base_table + '.' + field;
		if (view.fields[field]?.table) {
			f = view.fields[field].table + '.' + field;
		}
		if (view.fields[field]?.as) {
			selectArr.push(f + " AS " + view.fields[field].as);
			f = view.fields[field].as;
		} else {
			selectArr.push(f);
			// Still need to convert wildcard '*' for "proper" queryArgs keys.
			if (field === '*') {
				f = view.base_table + '.wildcard';
			}
		}

		// 2. Sorting (order).
		if (sorts && field in sorts) {
			// Preserve original sorting as fallback in case of equality.
			if (sort.length) {
				sort = `${field} ${sorts[field]}, ${sort}`;
			}
			else {
				sort = `${field} ${sorts[field]}`;
			}
		}

		// 3. Filters (conditions).
		if (filters && field in filters) {
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
	if (view?.distinct) {
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
	if (view?.group_by?.length) {
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

	// Debug.
	console.log(query);

	return { query, queryArgs, countQuery };
};
