<script>
	// import ExternalScript from '../ExternalScript.svelte';
	// import ChannelsIndex from '../experiments/ChannelsIndex.svelte';
	import { route } from '../../stores/route.js';
	import { writable } from 'svelte/store';
	import Select from 'svelte-select';

	const documentsStore = writable([]);
	let documents = [];
	let selectItems = [];

	const multiSelectSearchesInKeys = ['tags', 'types', 'names', 'author', 'channel'];
	let filterOp = 'and';
	let filterSelect;
	let selectedFilterItems;

	// Init custom data.
	route.subscribe(o => {
		if (o.data && o.data.channels_urls) {
			documents = o.data.channels_urls.documents;
			documentsStore.set([...documents]);
		}
	});

	/**
	 * Populates the multi-select field items.
	 */
	const getSelectItems = (docs) => {
		docs.forEach(doc => {

			// Special case : Emojis.
			if ('reactions' in doc && doc.reactions.length) {
				doc.reactions.forEach(reaction => {
					selectItems.push({
						key: 'reactions',
						value: reaction.name,
						label: reaction.name
					});
				});
			}

			multiSelectSearchesInKeys.forEach(key => {
				if (key in doc) {
					doc[key].split(',').forEach(val => {
						val = val.trim();
						if (!val.length) {
							return;
						}

						// Unify channel name and tags.
						key = key.replace('channel', 'tags');

						selectItems.push({
							key,
							value: val,
							label: `${val} <span style="color:grey">(${key})</span>`
						});
					});
				}
			});
		});

		// Remove duplicates.
		let seen = {};
		const dedup = selectItems.filter(item =>
			seen.hasOwnProperty(item.label) ? false : (seen[item.label] = true)
		);

		// Sort alphabetically (using translitteration).
		dedup.sort((a, b) => a.value.localeCompare(b.value));

		return dedup;
	};

	/**
	 * Filters results based on the multi-select field current selection.
	 */
	const applySelectFilter = (selectedVal) => {
		if (!selectedFilterItems) {
			clearSelectFilter();
			return;
		}

		// Debug.
		// console.log(`applySelectFilter() : selectedFilterItems (${filterOp}) = ${JSON.stringify(selectedFilterItems.map(v => v.value))}`);

		// const checkResultHasSufficientKeys = result => {
		// 	for (let i = 0; i < multiSelectSearchesInKeys.length; i++) {
		// 		const key = multiSelectSearchesInKeys[i];
		// 		if (key in result && result[key].length) {
		// 			return true;
		// 		}
		// 	}
		// 	return false;
		// };

		switch (filterOp) {
			case 'and':
				applySelectFilterAnd();
				break;
			case 'or':
				applySelectFilterOr();
				break;
		}
	};

	/**
	 * Applies "and" filtering for the multi-select field.
	 */
	const applySelectFilterAnd = () => {
		documentsStore.update(currentResults => {
			let newResults = [];

			for (let i = 0; i < documents.length; i++) {
				const result = documents[i];
				let allFilterValuesMatch = true;

				selectedFilterItems.forEach(selectedFilterItem => {
					// Emojis.
					// if (!('reactions' in result) || !result.reactions.includes(selectedFilterItem.value)) {
					// 	allFilterValuesMatch = false;
					// }

					if (!(selectedFilterItem.key in result) || !result[selectedFilterItem.key].includes(selectedFilterItem.value)) {
						allFilterValuesMatch = false;
					}
				});

				if (allFilterValuesMatch) {
					newResults.push(result);
				}
			}

			return newResults;
		});
	};

	/**
	 * Applies "or" filtering for the multi-select field.
	 */
	const applySelectFilterOr = () => {
		documentsStore.update(currentResults => {
			let newResults = [];

			for (let i = 0; i < documents.length; i++) {
				const result = documents[i];
				let anyFilterValueMatches = false;

				selectedFilterItems.forEach(selectedFilterItem => {
					// Emojis.
					// if ('reactions' in result && result.reactions.includes(selectedFilterItem.value)) {
					// 	anyFilterValueMatches = true;
					// }

					if (selectedFilterItem.key in result && result[selectedFilterItem.key].includes(selectedFilterItem.value)) {
						anyFilterValueMatches = true;
					}
				});

				if (anyFilterValueMatches) {
					newResults.push(result);
				}
			}

			return newResults;
		});
	};

	/**
	 * Resets results to initially loaded documents.
	 */
  const clearSelectFilter = () => {
		// Debug.
		// console.log(`clearSelectFilter() : (${filterOp}, ${documents.length} results)`);

		documentsStore.set(documents);
	};

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
		const isOff = e.target.classList.contains('is-off');
		const isAsc = e.target.classList.contains('is-asc');
		const isDesc = e.target.classList.contains('is-desc');

		let newState;

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
		documentsStore.set(documents);

		// Sync sort links state.
		const allSortLinks = Array.from(e.target.closest('thead').querySelectorAll('.sort'));
		allSortLinks.forEach(sortLink => {
			sortLink.classList.remove('is-asc', 'is-desc');
			sortLink.classList.add('is-off');
		});
		e.target.classList.remove('is-off');
		e.target.classList.add(newState);
	};
</script>

<!-- <ExternalScript url="https://unpkg.com/lunr/lunr.js" on:loaded="{onLoaded}" /> -->
<!-- {#if loading}
	<p>Loading external lib...</p>
{:else}
	<ChannelsIndex />
{/if} -->

<form>
	<div class="select">
		<Select items={getSelectItems($documentsStore)} isMulti={true}
			on:select={applySelectFilter}
			on:clear={clearSelectFilter}
			bind:selectedValue={selectedFilterItems}
			>
		</Select>
	</div>
	<div>
		<div class="radio">
			<input type="radio" id="filter-op-or" name="filter-op" value="or"
				bind:group={filterOp}
				on:change={applySelectFilter}
				/>
			<label for="filter-op-or">Or</label>
		</div>
		<div class="radio">
			<input type="radio" id="filter-op-and" name="filter-op" value="and"
				bind:group={filterOp}
				on:change={applySelectFilter}
				/>
			<label for="filter-op-and">And</label>
		</div>
	</div>
</form>

<p><strong>{ $documentsStore.length }</strong> results</p>

<!-- DEBUG -->
<!-- <pre>ExpChannelsIndex.svelte : documents = {JSON.stringify($documentsStore, null, 2)}</pre> -->
<!-- <pre>ExpChannelsIndex.svelte : filterOp = {JSON.stringify(filterOp, null, 2)}</pre> -->
<!-- <pre>ExpChannelsIndex.svelte : documents = {JSON.stringify(getDocuments(), null, 2)}</pre> -->

<div class="full-vw">
	<table>
		<thead>
			<th>
				<a class="sort is-desc" on:click={e => sortBy(e, 'date_shared')} title="Trier par date de partage">
					<span class="is-asc">↑</span>
					<span class="is-desc">↓</span>
					Date shared
				</a>
			</th>
			<th>
				<a class="sort is-off" on:click={e => sortBy(e, 'reactions')} title="Trier par nombre de réactions">
					<span class="is-asc">↑</span>
					<span class="is-desc">↓</span>
					Reactions
				</a>
			</th>
			<th>
				<a class="sort is-off" on:click={e => sortBy(e, 'title')} title="Trier par titre">
					<span class="is-asc">↑</span>
					<span class="is-desc">↓</span>
					Title
				</a>
			</th>
			<th>
				<a class="sort is-off" on:click={e => sortBy(e, 'type')} title="Trier par titre">
					<span class="is-asc">↑</span>
					<span class="is-desc">↓</span>
					Type
				</a>
			</th>
			<th>Tags</th>
			<th>
				<a class="sort is-off" on:click={e => sortBy(e, 'author')} title="Trier par auteur">
					<span class="is-asc">↑</span>
					<span class="is-desc">↓</span>
					Author
				</a>
			</th>
			<th>
				<a class="sort is-off" on:click={e => sortBy(e, 'names')} title="Trier par noms">
					<span class="is-asc">↑</span>
					<span class="is-desc">↓</span>
					Names
				</a>
			</th>
			<th>Description</th>
		</thead>
		<tbody>
		{#each $documentsStore as doc, i}
			<tr>
				<td>{ new Date(doc.date_shared).toLocaleDateString({ year: "numeric", month: "2-digit", day: "2-digit" }) }</td>
				<td>
					{#if doc.reactions}
						{#each doc.reactions as reaction}
							{#each Array(reaction.count) as _, row}
								<span class="emoji">{ reaction.name }</span>
								<!-- <img src="{ reaction.imgPath }" alt="Emoji : { reaction.name }" /> -->
							{/each}
						{/each}
					{/if}
				</td>
				<td><a class="title" href="{ doc.url }">{ doc.title }</a></td>
				<td>{ doc.type || '' }</td>
				<td>{ doc.tags || '' }</td>
				<td>{ doc.author || '' }</td>
				<td>{ doc.names || '' }</td>
				<td><div class="desc">{ doc.description || '' }</div></td>
			</tr>
		{/each}
		</tbody>
	</table>
</div>

<style>
	form {
		display: flex;
		justify-items: center;
		align-items: center;
	}
	form > * + * {
		padding-left: var(--space-s);
	}
	.select {
		flex-grow: 1;
	}
	.radio,
	.radio > * {
		cursor: pointer;
	}
	.radio {
		display: flex;
	}
	.radio label {
		padding-left: var(--space-s);
	}
	.radio label:hover {
		text-decoration: underline;
	}
	p {
		margin-top: var(--space-s);
	}
	table {
		margin-left: var(--space);
		margin-right: var(--space);
	}
	.title {
		display: inline-block;
		word-wrap: break-word;
		max-width: 42ch;
	}
	.desc {
		max-width: 76ch;
	}
	.sort {
		display: flex;
		cursor: pointer;
	}
	.sort > span{
		padding-right: var(--space-s);
	}
	.sort.is-off .is-asc,
	.sort.is-off .is-desc {
		display: none;
	}
	:global(.sort.is-asc .is-desc) {
		display: none;
	}
	.sort.is-desc .is-asc {
		display: none;
	}
</style>
