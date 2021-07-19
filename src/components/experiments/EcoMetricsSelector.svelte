<script>
	import { deviceStore, selectionStore } from '../../stores/ecometrics.js';
	import Select from 'svelte-select';

	// Make the selection options initially the same as the whole dataset. The
	// available options will be reduced when users apply filters to select their
	// list of devices.
	let initialOptions = [];
	selectionStore.subscribe(data => {
		if ('options' in data && data.options.length) {
			initialOptions = data.options;
		}
	});

	// ["manufacturer","name","category","subcategory","kg_co_2eq_total","use","yearly_tec_k_wh","lifetime","use_location","date","sources","error","manufacturing","weight","assembly_location","screen_size","server_type","hdd_ssd","ram","cpu","u"]
	let selectItems = [];
	const searchKeys = ['manufacturer', 'name', 'screen_size', 'cpu', 'ram'];
	let filterOp = 'or';
	let selectedFilterItems;

	/**
	 * Populates the multi-select field items.
	 */
	const getSelectOptions = (selection) => {
		console.log(selection);
		selection.options.forEach(option => {
			searchKeys.forEach(key => {
				if (key in option) {
					let val = option[key];

					val = val.trim();
					if (!val.length) {
						return;
					}

					// Remove special characters.
					// const valDisplay = slugify(val, { lowercase: false, separator: ' ' });

					// TODO figure out simplest way to make this case insensitive.
					// const valCaseInsensitive = slugify(val, { separator: ' ' });

					selectItems.push({
						key,
						value: val,
						// label: `${valDisplay} <span style="color:grey">(${key})</span>`
						label: `${val} <span style="color:grey">(${key})</span>`
					});
				}
			});
		});

		// Remove duplicates.
		let seen = {};
		const dedup = selectItems.filter(item =>
			seen.hasOwnProperty(item.label) ? false : (seen[item.label] = true)
		);

		// Sort alphabetically.
		dedup.sort((a, b) => a.label.localeCompare(b.label));

		return dedup;
	};


	/**
	 * Filters results based on the multi-select field current selection.
	 */
	 const applyFilter = (selectedVal) => {
		if (!selectedFilterItems) {
			clearfilter();
			return;
		}
		switch (filterOp) {
			case 'and':
				applyFilterAnd();
				break;
			case 'or':
				applyFilterOr();
				break;
		}
	};

	/**
	 * Applies "and" filtering for the multi-select field.
	 */
	const applyFilterAnd = () => {
		selectionStore.update(currentResults => {
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
	const applyFilterOr = () => {
		selectionStore.update(currentResults => {
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
	 * Resets selection to initial options.
	 */
  const clearFilters = () => {
		selectionStore.update(currentSelection => {
			currentSelection.options = initialOptions;
			return currentSelection;
		});
	};

</script>

{#if $deviceStore.rows.length}
	<form>
		<div class="select">
			<Select items={getSelectOptions($selectionStore)} isMulti={true}
				on:select={applyFilter}
				on:clear={clearFilters}
				bind:selectedValue={selectedFilterItems}
			/>
		</div>
		<div>
			<div class="radio">
				<input type="radio" id="filter-op-or" name="filter-op" value="or"
					bind:group={filterOp}
					on:change={applyFilter}
					/>
				<label for="filter-op-or">Or</label>
			</div>
			<div class="radio">
				<input type="radio" id="filter-op-and" name="filter-op" value="and"
					bind:group={filterOp}
					on:change={applyFilter}
					/>
				<label for="filter-op-and">And</label>
			</div>
		</div>
	</form>
{/if}

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
