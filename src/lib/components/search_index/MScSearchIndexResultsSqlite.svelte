<script>
	import { getResults } from '$lib/search_index';
	import { appIsBusy } from '$lib/stores/globalState.js';
	import { documentStore } from '$lib/stores/mscSearchIndex';

	// Heavy operation -> show loading feedback -> delay between stores updates.
	let timeOut = null;

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
				documentStore.update(o => {
					o.results = getResults(o.db, { filters: o.filters, orderBy: key + ' DESC' });
					return o;
				});
			} else {
				newState = 'is-asc';
				documentStore.update(o => {
					o.results = getResults(o.db, { filters: o.filters, orderBy: key + ' ASC' });
					return o;
				});
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

<p><strong>{ $documentStore.totalDocs }</strong> results</p>

<div class="full-vw">
	<table>
		<thead>
			<th class="is-active">
				<button class="sort is-desc" on:click={e => sortBy(e, 'document.date_shared')} title="Trier par date de partage">
					<span class="is-asc">↑</span>
					<span class="is-desc">↓</span>
					Date shared
				</button>
			</th>
			<th>
				<button class="sort is-off" on:click={e => sortBy(e, 'reactions_qty')} title="Trier par nombre de réactions">
					<span class="is-asc">↑</span>
					<span class="is-desc">↓</span>
					Reactions
				</button>
			</th>
			<th>
				<button class="sort is-off" on:click={e => sortBy(e, 'document.title')} title="Trier par titre">
					<span class="is-asc">↑</span>
					<span class="is-desc">↓</span>
					Title
				</button>
			</th>
			<th>Tags</th>
			<th>
				<button class="sort is-off" on:click={e => sortBy(e, 'author')} title="Trier par auteur">
					<span class="is-asc">↑</span>
					<span class="is-desc">↓</span>
					Author
				</button>
			</th>
			<th>
				<button class="sort is-off" on:click={e => sortBy(e, 'names')} title="Trier par noms">
					<span class="is-asc">↑</span>
					<span class="is-desc">↓</span>
					Names
				</button>
			</th>
			<th>Description</th>
		</thead>
		<tbody>
		{#each $documentStore.results as doc}
			<tr>
				<td>
					<div class="narrow">
						{ new Date(doc.date_shared).toLocaleDateString('fr', { year: "numeric", month: "2-digit", day: "2-digit" }) }
					</div>
				</td>
				<td>
					{#if doc.reactions}
						{#each doc.reactions as reaction}
							{#each Array(reaction.count) as _}
								<span class="emoji">{ reaction.name }</span>
							{/each}
						{/each}
					{/if}
				</td>
				<td><a class="title" href="{ doc.url }">{ doc.title }</a></td>
				<td>{ doc.tags || '' }</td>
				<td>{ doc.author || '' }</td>
				<td>{ doc.names || '' }</td>
				<td class="wide"><div class="desc">{ doc.description || '' }</div></td>
			</tr>
		{/each}
		</tbody>
	</table>
</div>

<style>
	p {
		margin-top: var(--space-s);
	}
	table {
		width: calc(100% - var(--space) * 2);
	}
	tbody {
		font-size: .9rem;
	}
	.title {
		display: inline-block;
		max-width: 42ch;
	}
	.desc {
		max-width: 76ch;
	}
	.narrow {
		max-width: 10ch;
	}
</style>
