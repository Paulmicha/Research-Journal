<script>
	import { getContext } from 'svelte';
	import slugify from '@sindresorhus/slugify';
	import { filterView } from '$lib/view';
	import { appIsBusy } from '$lib/stores/globalState.js';
	import Select from 'svelte-select';

	const view = getContext('view');

	// [minor] Deal with main layout width adjustments when scrollbar (dis)appears.
	// @see src/routes/__layout.svelte
	const updateCssWidth = getContext('updateCssWidth');

	// Heavy operation -> show loading feedback -> delay between stores updates.
	let timeOut = null;

	/**
	 * Populates the multi-select field items.
	 */
	const getSelectItems = table => {
		const selectItems = [];
		const filterValues = $view?.filters[table]?.options || [];
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
		if (!e?.detail) {
			clearSelectFilter(table);
			return;
		}
		appIsBusy.set(true);

		const selectedOptions = [];
		e.detail.forEach(f => {
			selectedOptions.push(f.value);
		});

		if (timeOut) {
			clearTimeout(timeOut);
		}
		timeOut = setTimeout(() => {
			view.update(o => {
				filterView(o, table, selectedOptions);
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
		appIsBusy.set(true);
		if (timeOut) {
			clearTimeout(timeOut);
		}
		const callback = table => {
			view.update(o => {
				filterView(o, table);
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
		{#if $view.filters}
			{#each Object.keys($view.filters) as f}
				<div class="f-grid-item { $view.filters[f]?.wrapperClass || '' }">
					<Select
						isMulti={ true }
						items={ getSelectItems(f) }
						on:select={ e => applySelectFilter(e, f) }
						on:clear={ e => clearSelectFilter(e, f) }
						placeholder={ $view.filters[f]?.label }
					/>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.f-grid-item {
		max-width: 42ch;
	}
	.f-grid-item.narrow {
		max-width: 22ch;
	}
</style>
