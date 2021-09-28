<script>
	import Select from 'svelte-select';
	import slugify from '@sindresorhus/slugify';
	import { getResults, getResultsCount, getFilterValues } from '$lib/search_index';
	import { appIsBusy } from '$lib/stores/globalState.js';
	import { documentStore } from '$lib/stores/mscSearchIndex';

	// Heavy operation -> show loading feedback -> delay between stores updates.
	let timeOut = null;

	let selectedFilterItems;
	const filterTables = ['tag', 'person', 'reaction'];

	/**
	 * Populates the multi-select field items.
	 */
	const getSelectItems = () => {
		const selectItems = [];
		if (!('db' in $documentStore) || !$documentStore.db) {
			return selectItems;
		}
		filterTables.forEach(table => {
			const filterValues = getFilterValues($documentStore.db, table);
			filterValues.forEach(val => {
				if (!val.name.trim().length) {
					return;
				}
				let label = val.name;
				if (table !== 'reaction') {
					label = `${slugify(val.name, { lowercase: false, separator: ' ' })} <span style="color:grey">(${table})</span>`;
				}
				selectItems.push({
					label,
					table,
					value: val.id
				});
			});
		});
		// Remove duplicates.
		let seen = {};
		const dedup = selectItems.filter(item =>
			seen.hasOwnProperty(item.label) ? false : (seen[item.label] = true)
		);
		// Sort alphabetically (using translitteration).
		dedup.sort((a, b) => a.label.localeCompare(b.label));
		return dedup;
	};

	/**
	 * Filters results based on the multi-select field current selection.
	 */
	const applySelectFilter = () => {
		if (!('db' in $documentStore) || !$documentStore.db) {
			return;
		}

		// Debug.
		// console.log("applySelectFilter()");
		// console.log(selectedFilterItems);

		if (!selectedFilterItems) {
			clearSelectFilter();
			return;
		}
		appIsBusy.set(true);

		const filtersByTable = {};

		selectedFilterItems.forEach(f => {
			if (!(f.table in filtersByTable)) {
				filtersByTable[f.table] = [];
			}
			filtersByTable[f.table].push(f.value);
		});

		const filters = Object.keys(filtersByTable).map(table => {
			return {
				table,
				ids: filtersByTable[table]
			};
		});

		if (timeOut) {
			clearTimeout(timeOut);
		}
		timeOut = setTimeout(() => {
			documentStore.update(o => {
				o.filters = filters;
				o.results = getResults(o.db, { filters });
				o.totalDocs = getResultsCount(o.db, { filters });
				return o;
			});
			appIsBusy.set(false);
		}, 150);
	};

	/**
	 * Resets results to initially loaded documents.
	 */
  const clearSelectFilter = () => {
		if (!('db' in $documentStore) || !$documentStore.db) {
			return;
		}
		appIsBusy.set(true);
		if (timeOut) {
			clearTimeout(timeOut);
		}
		timeOut = setTimeout(() => {
			documentStore.update(o => {
				o.filters = [];
				o.results = getResults(o.db);
				o.totalDocs = getResultsCount(o.db);
				return o;
			});
			appIsBusy.set(false);
		}, 150);
	};
</script>

<Select items={ getSelectItems($documentStore.results) } isMulti={ true }
	on:select={ applySelectFilter }
	on:clear={ clearSelectFilter }
	bind:value={ selectedFilterItems }
	>
</Select>
