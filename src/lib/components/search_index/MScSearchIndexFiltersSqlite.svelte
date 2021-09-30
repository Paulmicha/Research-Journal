<script>
	import { getContext } from 'svelte';
	import Select from 'svelte-select';
	import slugify from '@sindresorhus/slugify';
	import { getResults, getResultsCount, getFilterValues } from '$lib/search_index';
	import { appIsBusy } from '$lib/stores/globalState.js';
	import { documentStore } from '$lib/stores/mscSearchIndex';

	// [minor] Deal with main layout width adjustments when scrollbar (dis)appears.
	// @see src/routes/__layout.svelte
	const updateCssWidth = getContext('updateCssWidth');

	// Heavy operation -> show loading feedback -> delay between stores updates.
	let timeOut = null;

	// let selectedFilterItems;
	// const filterTables = ['tag', 'person', 'reaction'];

	/**
	 * Populates the multi-select field items.
	 */
	const getSelectItems = table => {
		const selectItems = [];
		if (!('db' in $documentStore) || !$documentStore.db) {
			return selectItems;
		}
		// filterTables.forEach(table => {
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
		// });
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
	const applySelectFilter = (e, table) => {
		if (!('db' in $documentStore) || !$documentStore.db) {
			return;
		}

		if (!e?.detail) {
			clearSelectFilter(table);
			return;
		}
		appIsBusy.set(true);

		const filtersByTable = {};

		e.detail.forEach(f => {
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
				o.filters = [...o.filters, ...filters];
				o.results = getResults(o.db, { filters: o.filters });
				o.totalDocs = getResultsCount(o.db, { filters: o.filters });
				return o;
			});
			appIsBusy.set(false);
			setTimeout(updateCssWidth, 100);
		}, 150);
	};

	/**
	 * Resets results to initially loaded documents.
	 */
  const clearSelectFilter = table => {
		if (!('db' in $documentStore) || !$documentStore.db) {
			return;
		}
		appIsBusy.set(true);
		if (timeOut) {
			clearTimeout(timeOut);
		}
		const callback = table => {
			documentStore.update(o => {
				if (table?.length) {
					o.filters = o.filters.filter(f => f.table != table);
				} else {
					o.filters = [];
				}
				o.results = getResults(o.db, { filters: o.filters });
				o.totalDocs = getResultsCount(o.db, { filters: o.filters });
				return o;
			});
			appIsBusy.set(false);
			setTimeout(updateCssWidth, 100);
		};
		timeOut = setTimeout(callback, 150, table);
	};
</script>

<!-- TODO this makes it impossible to select any item (but optimizes sensibly) -->
<!-- isVirtualList={ true } -->

<div class="full-vw">
	<div class="f-grid f-grid--g">
		<div class="f-grid-item narrow">
			<Select
				isMulti={ true }
				items={ getSelectItems('reaction') }
				on:select={ e => applySelectFilter(e, 'reaction') }
				on:clear={ e => clearSelectFilter(e, 'reaction') }
				placeholder="Filter by emoji"
			/>
		</div>
		<div class="f-grid-item">
			<Select
				isMulti={ true }
				items={ getSelectItems('tag') }
				on:select={ e => applySelectFilter(e, 'tag') }
				on:clear={ e => clearSelectFilter(e, 'tag') }
				placeholder="Filter by tags"
			/>
		</div>
		<div class="f-grid-item">
			<Select
				isMulti={ true }
				items={ getSelectItems('person') }
				on:select={ e => applySelectFilter(e, 'person') }
				on:clear={ e => clearSelectFilter(e, 'person') }
				placeholder="Filter by names"
			/>
		</div>
	</div>
</div>

<style>
	.f-grid-item {
		max-width: 42ch;
	}
	.f-grid-item.narrow {
		max-width: 33ch;
	}
</style>
