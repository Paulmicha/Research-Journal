<script>
	import { documentStore } from '$lib/stores/mscSearchIndex';

	/**
	 * Helper to count total number of reactions.
	 */
	const getReactionsCount = doc => {
		if (!('reactions' in doc) || !doc.reactions.length) {
			return 0;
		}
		let count = 0;
		doc.reactions.forEach(reaction => {
			count += reaction.count;
		});
		return count;
	}

	/**
	 * Helper to return value by given key or fallback value if doc has no key.
	 *
	 * fallback value defaults to empty string.
	 */
	const getDocValOr = (doc, key, fallback) => {
		if (!fallback) {
			fallback = '';
		}
		if (!(key in doc)) {
			return fallback;
		}
		return doc[key];
	}

	/**
	 * Sorts results on given key.
	 *
	 * Inverts order if already active.
	 */
	const sortBy = (e, key) => {
		let btn = e.target;
		if (e.target.tagName !== 'BUTTON') {
			btn = e.target.closest('button');
		}

		const isOff = btn.classList.contains('is-off');
		const isAsc = btn.classList.contains('is-asc');
		const isDesc = btn.classList.contains('is-desc');

		let newState;
		const documents = [...$documentStore.results];

		switch (key) {
			case 'date_shared':
				if (isOff || isAsc) {
					documents.sort((a, b) => new Date(b.date_shared).getTime() - new Date(a.date_shared).getTime());
					newState = 'is-desc';
				} else {
					documents.sort((a, b) => new Date(a.date_shared).getTime() - new Date(b.date_shared).getTime());
					newState = 'is-asc';
				}
				break;
			case 'reactions':
				if (isOff || isAsc) {
					documents.sort((a, b) => getReactionsCount(b) - getReactionsCount(a));
					newState = 'is-desc';
				} else {
					documents.sort((a, b) => getReactionsCount(a) - getReactionsCount(b));
					newState = 'is-asc';
				}
				break;
			default:
				if (isOff || isDesc) {
					documents.sort((a, b) => getDocValOr(a, key, 'z').localeCompare(getDocValOr(b, key, 'z')));
					newState = 'is-asc';
				} else {
					documents.sort((a, b) => getDocValOr(b, key, 'z').localeCompare(getDocValOr(a, key, 'z')));
					newState = 'is-desc';
				}
				break;
		}

		// Update docs in their new order.
		documentStore.update(o => {
			o.results = documents;
			return o;
		});

		// Re-apply active filters (if any).
		// if (selectedFilterItems) {
		// 	switch (filterOp) {
		// 		case 'and':
		// 			applySelectFilterAnd();
		// 			break;
		// 		case 'or':
		// 			applySelectFilterOr();
		// 			break;
		// 	}
		// }

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

<!-- <p>Showing the last 150 of <strong>{ $documentStore.totalDocs }</strong> results</p> -->

<div class="full-vw">
	<table>
		<thead>
			<th class="is-active">
				<button class="sort is-desc" on:click={e => sortBy(e, 'date_shared')} title="Trier par date de partage">
					<span class="is-asc">↑</span>
					<span class="is-desc">↓</span>
					Date shared
				</button>
			</th>
			<th>
				<button class="sort is-off" on:click={e => sortBy(e, 'reactions')} title="Trier par nombre de réactions">
					<span class="is-asc">↑</span>
					<span class="is-desc">↓</span>
					Reactions
				</button>
			</th>
			<th>
				<button class="sort is-off" on:click={e => sortBy(e, 'title')} title="Trier par titre">
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
		{#if $documentStore.results}
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
		{/if}
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
