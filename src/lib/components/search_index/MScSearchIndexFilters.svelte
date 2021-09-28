<script>
	import Select from 'svelte-select';
	import slugify from '@sindresorhus/slugify';
	import { documentStore } from '$lib/stores/mscSearchIndex';

	let filterOp = 'or';
	let selectItems = [];
	let selectedFilterItems;
	const multiSelectSearchesInKeys = ['tags', 'names', 'author'];

	/**
	 * Populates the multi-select field items.
	 */
	const getSelectItems = (docs) => {
		if (!docs || !docs.length) {
			return selectItems;
		}
		docs.forEach(doc => {
			// Special case : Emojis.
			// TODO implement custom replacements for filtering by emojis using
			// natural language ?
			if ('reactions' in doc && Array.isArray(doc.reactions)) {
				doc.reactions.forEach(reaction => {
					selectItems.push({
						key: 'reactions',
						value: reaction.name,
						label: reaction.name
					});
				});
			}
			multiSelectSearchesInKeys.forEach(key => {
				if (key in doc && doc[key]) {
					doc[key].replace(/;/g, ',').split(',').forEach(val => {
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
		documentStore.update(o => {
			let newResults = [];
			const documents = ('all' in o && o.all.length) ? o.all : o.initial; // TODO get docs sst.
			for (let i = 0; i < documents.length; i++) {
				const result = documents[i];
				let allFilterValuesMatch = true;
				selectedFilterItems.forEach(selectedFilterItem => {
					// Emojis are arrays of objects.
					if (
						selectedFilterItem.key === 'reactions'
						&& 'reactions' in result
						&& result.reactions.length
					) {
						let noneMatches = true;
						result.reactions.forEach(reaction => {
							if (reaction.name === selectedFilterItem.value) {
								noneMatches = false;
							}
						});
						if (noneMatches) {
							allFilterValuesMatch = false;
						}
					} else if (
						!(selectedFilterItem.key in result)
						|| !result[selectedFilterItem.key].includes(selectedFilterItem.value)
					) {
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
		documentStore.update(o => {
			let newResults = [];
			const documents = ('all' in o && o.all.length) ? o.all : o.initial; // TODO get docs sst.
			for (let i = 0; i < documents.length; i++) {
				const result = documents[i];
				let anyFilterValueMatches = false;
				selectedFilterItems.forEach(selectedFilterItem => {
					// Emojis are arrays of objects.
					if (
						selectedFilterItem.key === 'reactions'
						&& 'reactions' in result
						&& result.reactions.length
					) {
						result.reactions.forEach(reaction => {
							if (reaction.name === selectedFilterItem.value) {
								anyFilterValueMatches = true;
							}
						});
					} else if (
						selectedFilterItem.key in result
						&& result[selectedFilterItem.key].includes(selectedFilterItem.value)
					) {
						anyFilterValueMatches = true;
					}
				});
				if (anyFilterValueMatches) {
					newResults.push(result);
				}
			}
			o.results = newResults;
			return o;
		});
	};

	/**
	 * Resets results to initially loaded documents.
	 */
  const clearSelectFilter = () => {
		documentStore.update(o => {
			const documents = ('all' in o && o.all.length) ? o.all : o.initial; // TODO get docs sst.
			o.results = documents;
			return o;
		});
	};
</script>

<form>
	<div class="select">
		<Select items={ getSelectItems($documentStore.results) } isMulti={ true }
			on:select={ applySelectFilter }
			on:clear={ clearSelectFilter }
			bind:value={ selectedFilterItems }
			>
		</Select>
	</div>
	<div>
		<div class="radio">
			<input type="radio" id="filter-op-or" name="filter-op" value="or"
				bind:group={ filterOp }
				on:change={ applySelectFilter }
				/>
			<label for="filter-op-or">Or</label>
		</div>
		<div class="radio">
			<input type="radio" id="filter-op-and" name="filter-op" value="and"
				bind:group={ filterOp }
				on:change={ applySelectFilter }
				/>
			<label for="filter-op-and">And</label>
		</div>
	</div>
</form>

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
</style>
