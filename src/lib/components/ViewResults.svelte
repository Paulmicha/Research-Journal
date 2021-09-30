<script>
	import { getContext } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import { appIsBusy } from '$lib/stores/globalState.js';
	import ViewResultsCell from './ViewResultsCell.svelte';

	// Heavy operation -> show loading feedback -> delay between stores updates.
	let timeOut = null;

	const view = getContext('view');
	const dispatch = createEventDispatcher();

	const getCellComponent = cell => {
		if (cell?.component) {
			return cell.component;
		}
		if (view?.cell_component) {
			return view.cell_component;
		}
	}

	/**
	 * Sorts results on given key.
	 *
	 * Inverts order if already active.
	 */
	const sortBy = (e, key) => {
		appIsBusy.set(true);

		if (timeOut) {
			clearTimeout(timeOut);
		}
		timeOut = setTimeout(() => {
			let btn = e.target;
			if (e.target.tagName !== 'BUTTON') {
				btn = e.target.closest('button');
			}

			let newState;
			const isOff = btn.classList.contains('is-off');
			const isAsc = btn.classList.contains('is-asc');

			if (isOff || isAsc) {
				newState = 'is-desc';
				dispatch('sort', { orderBy: key + ' DESC' });
				// documentStore.update(o => {
				// 	o.results = getResults(o.db, { filters: o.filters, orderBy: key + ' DESC' });
				// 	return o;
				// });
			} else {
				newState = 'is-asc';
				// documentStore.update(o => {
				// 	o.results = getResults(o.db, { filters: o.filters, orderBy: key + ' ASC' });
				// 	return o;
				// });
				dispatch('sort', { orderBy: key + ' ASC' });
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

			appIsBusy.set(false);
		}, 150);
	};

</script>

<div class="full-vw">
	<table>
		<thead>
			{#each Object.keys($view.fields) as f}
				{#if !$view.fields[f]?.hidden}
					{#if $view.fields[f]?.sort}
						<th class:is-active={ $view.fields[f]?.sort_default }>
							<button
								class="sort is-{ $view.fields[f].sort }"
								on:click={e => sortBy(e, view.fields[f].table)}
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
		</thead>
		<tbody>
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
