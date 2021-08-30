<script>
	import { getSelectedItemUseDefaultValue, updateSelectedItem } from '../../lib/ecometrics/selection.js';

	export let entity;

	let scope;

	/**
	 * Updates current entity selection settings.
	 *
	 * @param {Object} e : the DOM event object.
	 * @param {Object} entity : the device or service entity to update.
	 */
	const updateSettings = (e, entity) => {
		const settings = {};

		// settings.qty = scope.querySelector('input[name="qty"]').value;
		// settings.hours = scope.querySelector('input[name="hours"]').value;
		// settings.deploysNb = scope.querySelector('input[name="deploys_nb"]').value;
		// settings.deploysDuration = scope.querySelector('input[name="deploys_duration"]').value;
		// settings.backupsNb = scope.querySelector('input[name="backups_nb"]').value;
		// settings.backupsDuration = scope.querySelector('input[name="backups_duration"]').value;

		updateSelectedItem(entity, settings);
		e.target.blur();
	};
</script>


<!-- TODO rework settings attribution (introduce tags) -->

<div bind:this={scope}>
	<div class="inner-form-item">
		<label for="qty-{ entity.id }">Quantity</label>
		<input class="input--s" type="number" min="1" name="qty"
			id="deploys-per-month-{ entity.id }"
			value={ entity.selectionSettings.qty }
			on:change|preventDefault={ e => updateSettings(e, entity) }
		/>
	</div>

	{#if entity.subcategory === 'server'}
		<div class="inner-form-item">
			<label for="deploys-per-month-{ entity.id }" title="on average, during the development phase of the project">Deploys per month</label>
			<input class="input--s" type="number" min="1" name="deploys_nb"
				id="deploys-per-month-{ entity.id }"
				value={ entity.selectionSettings.deploys_nb || getSelectedItemUseDefaultValue(entity, 'deploys_nb') }
				on:change|preventDefault={ e => updateSettings(e, entity) }
			/>
		</div>
		<div class="inner-form-item">
			<label for="deploys-duration-{ entity.id }" title="with CI tests">Average deploys duration (seconds)</label>
			<input class="input--s" type="number" min="1" name="deploys_duration"
				id="deploys-duration-{ entity.id }"
				value={ entity.selectionSettings.deploys_duration || getSelectedItemUseDefaultValue(entity, 'deploys_duration') }
				on:change|preventDefault={ e => updateSettings(e, entity) }
			/>
		</div>
		<div class="inner-form-item">
			<label for="backups-per-month-{ entity.id }" title="on average, during the development phase of the project">Backups per month</label>
			<input class="input--s" type="number" min="1" name="backups_nb"
				id="backups-per-month-{ entity.id }"
				value={ entity.selectionSettings.backups_nb || getSelectedItemUseDefaultValue(entity, 'backups_nb') }
				on:change|preventDefault={ e => updateSettings(e, entity) }
			/>
		</div>
		<div class="inner-form-item">
			<label for="backups-duration-{ entity.id }" title="with CI tests">Average backups duration (seconds)</label>
			<input class="input--s" type="number" min="1" name="backups_duration"
				id="backups-duration-{ entity.id }"
				value={ entity.selectionSettings.backups_duration || getSelectedItemUseDefaultValue(entity, 'backups_duration') }
				on:change|preventDefault={ e => updateSettings(e, entity) }
			/>
		</div>
	{/if}

	<div class="inner-form-item">
		<label for="hours-per-day-{ entity.id }">Average hours of use per day</label>
		<input class="input--s" type="number" min="1" name="hours"
			id="hours-per-day-{ entity.id }"
			value={ entity.selectionSettings.hours || getSelectedItemUseDefaultValue(entity, 'hours') }
			on:change|preventDefault={ e => updateSettings(e, entity) }
		/>
	</div>
</div>

<style>
	.inner-form-item > .input--s {
		width: 3.3rem;
	}
	.inner-form-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.inner-form-item > label {
		display: inline-block;
		margin-left: auto;
		margin-right: var(--space-s);
		font-size: .8rem;
		/* white-space: nowrap; */
		text-align: right;
	}
</style>
