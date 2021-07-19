<script>
	// import ExternalScript from '../ExternalScript.svelte';
	// import ChannelsIndex from '../experiments/ChannelsIndex.svelte';
	import { route } from '../../stores/route.js';
	import { writable } from 'svelte/store';
	import Select from 'svelte-select';
	import slugify from '@sindresorhus/slugify';

	const documentsStore = writable([]);
	let documents = [];
	let selectItems = [];

	// Update : keep less filters.
	// const multiSelectSearchesInKeys = ['tags', 'type', 'names', 'author', 'channel'];
	const multiSelectSearchesInKeys = ['tags', 'names', 'author'];

	let filterOp = 'or';
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
			// TODO implement custom replacements for filtering by emojis using
			// natural language ?
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
					doc[key].replaceAll(';', ',').split(',').forEach(val => {
						val = val.trim();
						if (!val.length) {
							return;
						}

						// Manual cleanup of input human errors.
						if (val.startsWith(':')) {
							return;
						}
						if (val.indexOf("ai beaucoup appris dans") > 0) {
							val = val.split(' ')[0];
						}

						// Unify channel name and tags.
						key = key.replace('channel', 'tags');

						// Remove special characters.
						const valDisplay = slugify(val, { lowercase: false, separator: ' ' });

						// TODO figure out simplest way to make this case insensitive.
						// const valCaseInsensitive = slugify(val, { separator: ' ' });

						selectItems.push({
							key,
							value: val,
							label: `${valDisplay} <span style="color:grey">(${key})</span>`
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
		dedup.sort((a, b) => a.label.localeCompare(b.label));

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
					// Emojis are arrays of objects.
					if (selectedFilterItem.key === 'reactions' && 'reactions' in result && result.reactions.length) {
						let noneMatches = true;
						result.reactions.forEach(reaction => {
							if (reaction.name === selectedFilterItem.value) {
								noneMatches = false;
							}
						});
						if (noneMatches) {
							allFilterValuesMatch = false;
						}
					} else if (!(selectedFilterItem.key in result) || !result[selectedFilterItem.key].includes(selectedFilterItem.value)) {
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
					// Emojis are arrays of objects.
					if (selectedFilterItem.key === 'reactions' && 'reactions' in result && result.reactions.length) {
						result.reactions.forEach(reaction => {
							if (reaction.name === selectedFilterItem.value) {
								anyFilterValueMatches = true;
							}
						});
					} else if (selectedFilterItem.key in result && result[selectedFilterItem.key].includes(selectedFilterItem.value)) {
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
		let btn = e.target;
		if (e.target.tagName !== 'BUTTON') {
			btn = e.target.closest('button');
		}

		const isOff = btn.classList.contains('is-off');
		const isAsc = btn.classList.contains('is-asc');
		const isDesc = btn.classList.contains('is-desc');

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

		// Re-apply active filters (if any).
		if (selectedFilterItems) {
			switch (filterOp) {
				case 'and':
					applySelectFilterAnd();
					break;
				case 'or':
					applySelectFilterOr();
					break;
			}
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
			<!-- <th>
				<button class="sort is-off" on:click={e => sortBy(e, 'type')} title="Trier par titre">
					<span class="is-asc">↑</span>
					<span class="is-desc">↓</span>
					Type
				</button>
			</th> -->
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
		{#each $documentsStore as doc, i}
			<tr>
				<td><div class="narrow">{ new Date(doc.date_shared).toLocaleDateString('fr', { year: "numeric", month: "2-digit", day: "2-digit" }) }</div></td>
				<td>
					{#if doc.reactions}
						<!-- <div class="narrow"> -->
							{#each doc.reactions as reaction}
								{#each Array(reaction.count) as _, row}
									<span class="emoji">{ reaction.name }</span>
									<!-- <img src="{ reaction.imgPath }" alt="Emoji : { reaction.name }" /> -->
								{/each}
							{/each}
						<!-- </div> -->
					{/if}
				</td>
				<td><a class="title" href="{ doc.url }">{ doc.title }</a></td>
				<!-- <td><div class="narrow">{ doc.type_raw || '' }</div></td> -->
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
