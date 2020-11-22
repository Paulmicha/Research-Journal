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
	let selectFilterValues;

	// Init custom data.
	route.subscribe(o => {
		if (o.data && o.data.channels_urls) {
			documents = o.data.channels_urls.documents;
			documentsStore.set(documents);
		}
	});

	/**
	 * Populates the multi-select field items.
	 */
	$: getSelectItems = () => {
		documents.forEach(doc => {
			multiSelectSearchesInKeys.forEach(key => {
				if (key in doc) {
					doc[key].split(',').forEach(val => selectItems.push(val.trim()));
				}
			});
		});
		// Remove duplicates.
		const dedup = [...new Set(selectItems)];
		// Sort alphabetically (using translitteration).
		dedup.sort((a, b) => a.localeCompare(b));
		return dedup.filter(String);
	};

	/**
	 * Filters results based on the multi-select field current selection.
	 */
	const applySelectFilter = (selectedVal) => {
		if (!selectFilterValues) {
			clearSelectFilter();
			return;
		}

		// Debug.
		console.log(`applySelectFilter() : selectFilterValues (${filterOp}) = ${JSON.stringify(selectFilterValues.map(v => v.value))}`);

		const checkResultHasSufficientKeys = result => {
			for (let i = 0; i < multiSelectSearchesInKeys.length; i++) {
				const key = multiSelectSearchesInKeys[i];
				if (key in result && result[key].length) {
					return true;
				}
			}
			return false;
		};

		switch (filterOp) {
			case 'and':
				documentsStore.update(results => {
					for (let i = 0; i < results.length; i++) {
						const result = results[i];

						if (!checkResultHasSufficientKeys(results)) {
							results.splice(i, 1);
							continue;
						}

						selectFilterValues.forEach(filterValue => {
							let anyKeyMatches = false;

							Object.keys(result).forEach(key => {
								if (key in result && result[key].includes(filterValue)) {
									anyKeyMatches = true;
								}
							});
							if (!anyKeyMatches) {
								results.splice(i, 1);
							}
						});
					}
					return results;
				});
				break;

			case 'or':
				documentsStore.update(results => {
					for (let i = 0; i < results.length; i++) {
						const result = results[i];
						let anyFilterValueMatches = false;

						if (!checkResultHasSufficientKeys(results)) {
							results.splice(i, 1);
							continue;
						}

						selectFilterValues.forEach(filterValue => {
							Object.keys(result).forEach(key => {
								if (key in result && result[key].includes(filterValue)) {
									anyFilterValueMatches = true;
								}
							});
						});

						if (!anyFilterValueMatches) {
							results.splice(i, 1);
						}
					}
					return results;
				});
				break;
		}
	};

	/**
	 * Resets results to initially loaded documents.
	 */
  const clearSelectFilter = () => {
		// Debug.
		console.log(`clearSelectFilter() : (${filterOp}, ${documents.length} results)`);

		documentsStore.set(documents);
  };
</script>

<!-- DEBUG -->
<!-- <pre>ExpChannelsIndex.svelte : documents = {JSON.stringify($documentsStore, null, 2)}</pre> -->
<!-- <pre>ExpChannelsIndex.svelte : filterOp = {JSON.stringify(filterOp, null, 2)}</pre> -->
<!-- <pre>ExpChannelsIndex.svelte : documents = {JSON.stringify(getDocuments(), null, 2)}</pre> -->

<!-- <ExternalScript url="https://unpkg.com/lunr/lunr.js" on:loaded="{onLoaded}" /> -->
<!-- {#if loading}
	<p>Loading external lib...</p>
{:else}
	<ChannelsIndex />
{/if} -->

<form>
	<div class="select">
		<Select items={getSelectItems()} isMulti={true}
			on:select={applySelectFilter}
			on:clear={clearSelectFilter}
			bind:selectedValue={selectFilterValues}
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

<div class="full-vw">
	<table>
		<thead>
			<th>Date shared</th>
			<th>Title</th>
			<th>Type</th>
			<th>Tags</th>
			<th>Author</th>
			<th>Names</th>
			<th>Description</th>
		</thead>
		<tbody>
		{#each $documentsStore as doc, i}
			<tr>
				<td>{ new Date(doc.date_shared).toLocaleDateString({ year: "numeric", month: "2-digit", day: "2-digit" }) }</td>
				<td><a class="title" href="{ doc.url }">{ doc.title }</a></td>
				<td>{ doc.type || '' }</td>
				<td>{ doc.channel }{ doc.tags ? ', ' + doc.tags : '' }</td>
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
</style>
