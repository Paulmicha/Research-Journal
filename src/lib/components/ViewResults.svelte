<script>
	import { getContext } from 'svelte';
	import { sortView } from '$lib/view';
	import { appIsBusy } from '$lib/stores/globalState.js';
	import ViewResultsCell from './ViewResultsCell.svelte';

	// Heavy operation -> show loading feedback -> delay between stores updates.
	let timeOut = null;

	const view = getContext('view');

	const getCellComponent = cell => {
		if (cell?.component) {
			return cell.component;
		}
		if (view?.cell_component) {
			return view.cell_component;
		}
	}

	/**
	 * Applies the new sort order.
	 *
	 * @param {String} f the field name (table name or alias) to sort on.
	 * @param {String} dir either "ASC" or "DESC".
	 */
	const applySort = (f, dir) => {
		appIsBusy.set(true);
		if (timeOut) {
			clearTimeout(timeOut);
		}
		const callback = (f, dir) => {
			view.update(o => {
				sortView(o, f, dir);
				return o;
			});
			appIsBusy.set(false);
		};
		timeOut = setTimeout(callback, 150, f, dir);
	};

	/**
	 * Sorts results on given key.
	 *
	 * Inverts order if already active.
	 *
	 * @param {Object} e click event.
	 * @param {String} f the field name (table name or alias) to sort on.
	 */
	const sortBy = (e, f) => {
		let btn = e.target;
		if (e.target.tagName !== 'BUTTON') {
			btn = e.target.closest('button');
		}

		let newState;
		const isOff = btn.classList.contains('is-off');
		const isAsc = btn.classList.contains('is-asc');

		if (isOff || isAsc) {
			newState = 'is-desc';
			applySort(f, "DESC");
		} else {
			newState = 'is-asc';
			applySort(f, "ASC");
		}

		// Sync sort links state classes.
		const allSortLinks = Array.from(btn.closest('thead').querySelectorAll('.sort'));

		allSortLinks.forEach(sortLink => {
			sortLink.classList.remove('is-asc', 'is-desc');
			sortLink.classList.add('is-off');
			sortLink.closest('th').classList.remove('is-active');
		});

		btn.classList.remove('is-off');
		btn.classList.add(newState);
		btn.closest('th').classList.add('is-active');
	};

</script>

<div class="full-vw">
	<table>
		<thead>
			{#if $view?.fields}
				{#each Object.keys($view.fields) as f}
					{#if !$view.fields[f]?.hidden}
						{#if $view.fields[f]?.sortable}
							<th class:is-active={ $view.fields[f].sort_active }>
								<button
									class:is-off={ !$view.fields[f].sort_active }
									class:is-asc={ $view.fields[f].sort_active && ('sort_dir' in $view.fields[f] ? $view.fields[f].sort_dir.toLowerCase() : 'asc') === 'asc' }
									class:is-desc={ $view.fields[f].sort_active && ('sort_dir' in $view.fields[f] ? $view.fields[f].sort_dir.toLowerCase() : 'asc') === 'desc' }
									class="sort"
									on:click={e => sortBy(e, f)}
									title="Sort by { $view.fields[f].label }"
								>
									<span class="is-asc">↑</span>
									<span class="is-desc">↓</span>
									{ $view.fields[f].label }
								</button>
							</th>
						{:else}
							<th>{ $view.fields[f].label }</th>
						{/if}
					{/if}
				{/each}
			{/if}
		</thead>
		<tbody>
			{#if $view?.results?.length}
				{#each $view.results as result}
					<tr>
						{#each Object.keys($view.fields) as f}
							{#if !$view.fields[f]?.hidden}
								<td>
									{#if $view.fields[f] && getCellComponent($view.fields[f])}
										<svelte:component this={ getCellComponent($view.fields[f]) }
											{ result }
											value={ result[f] }
											cell={ $view.fields[f] }
										/>
									{:else}
										<ViewResultsCell
											{ result }
											value={ result[f] }
											cell={ $view.fields[f] }
										/>
									{/if}
								</td>
							{/if}
						{/each}
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>

<style>
	table {
		width: calc(100% - var(--space) * 2);
	}
	tbody {
		font-size: .9rem;
	}
	.desc {
		max-width: 76ch;
	}
</style>
