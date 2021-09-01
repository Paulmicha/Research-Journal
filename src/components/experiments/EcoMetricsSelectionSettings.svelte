<script>
	import { selectionStore } from '../../stores/ecometrics.js';
	import { getSelectedItemUseDefaultValue, updateSelectedItem } from '../../lib/ecometrics/selection.js';
	import { getLocationLabel } from '../../lib/ecometrics/location.js';
	import Tooltip from '../Tooltip.svelte';
	import Ellipsis from '../Ellipsis.svelte';

	// Device or service data input.
	export let entity;
	export let pos;

	// Reuse the location tooltip "singleton".
	// @see src/components/experiments/EcoMetricsSelector.svelte
	export let toggleLocationTooltip;

	let usesTooltipTrigger;
	let usesTooltipMethods;

	// Using variables allows to benefit from Svelte's {#if} "auto-update".
	let useRepo = entity.selectionSettings.useRepo || false;
	let useHost = entity.selectionSettings.useHost || false;
	let useBackup = entity.selectionSettings.useBackup || false;
	let useDeploy = entity.selectionSettings.useDeploy || false;
	let useTests = entity.selectionSettings.useTests || false;

	/**
	 * Updates current entity selection settings.
	 *
	 * @param {Object} e : the DOM event object.
	 */
	const updateSettings = e => {
		const settings = entity.selectionSettings;
		// Checkboxes must use "checked" instead of "value" to compare with the
		// default use value.
		let comparedValue = e.target.value;
		if (e.target.getAttribute('type') === 'checkbox') {
			comparedValue = e.target.checked;
		}
		if (comparedValue != getSelectedItemUseDefaultValue(entity, e.target.name)) {
			settings[e.target.name] = comparedValue;
		} else {
			delete settings[e.target.name];
		}
		updateSelectedItem(entity, pos, settings);
		e.target.blur();
	};

	/**
	 * Current input value getter.
	 */
	const getValue = key => entity.selectionSettings[key]
		|| getSelectedItemUseDefaultValue(entity, key);

</script>

<!-- Tooltips for selecting use cases and location -->
<div class="inner-form-item tooltip-triggers">
	<!-- For "server" devices and services, display an opt-in list of uses -->
	{#if entity.subcategory === 'server' || entity.entityType === 'service'}
		<button
			class="link link--s"
			bind:this={ usesTooltipTrigger }
			aria-describedby={ 'tooltip-uses-' + entity.id }
			on:click|preventDefault={ usesTooltipMethods.toggle }
			title="Specify what this is used for"
		>
			Use cases
		</button>
	{/if}
	<!-- Any selected entity may override the default location -->
	<div class="location-wrap">
		<button
			class="link link--s"
			aria-describedby='tooltip-default-location'
			on:click|preventDefault={ toggleLocationTooltip }
			data-entity-id={ entity.id }
			data-entity-type={ entity.entityType }
			title="Change the location for this particular { entity.entityType }"
		>
			{#if entity.selectionSettings.location && entity.selectionSettings.location.id != $selectionStore.defaultLocation.id}
				Location
			{:else}
				Default location
			{/if}
		</button>&nbsp;:
		<Ellipsis
			valign="middle"
			text="{ getLocationLabel(entity.selectionSettings.location || $selectionStore.defaultLocation) }"
		/>
	</div>
</div>

<!-- Tooltip contents for selecting list of uses -->
{#if usesTooltipTrigger}
	<Tooltip
		id={ 'tooltip-uses-' + entity.id }
		trigger={ usesTooltipTrigger }
		bind:exposedMethods={ usesTooltipMethods }
	>
		<div class="inner-form-item">
			<label for="use-case-repo-{ entity.id }">
				as a code repository (e.g. git, svn)
			</label>
			<input
				type="checkbox" name="useRepo"
				id="use-case-repo-{ entity.id }"
				bind:checked={ useRepo }
				on:change|preventDefault={ updateSettings }
			/>
		</div>
		<div class="inner-form-item">
			<label for="use-case-host-{ entity.id }">
				as a host
			</label>
			<input
				type="checkbox" name="useHost"
				id="use-case-host-{ entity.id }"
				bind:checked={ useHost }
				on:change|preventDefault={ updateSettings }
			/>
		</div>
		<div class="inner-form-item">
			<label for="use-case-backup-{ entity.id }">
				as a backup destination
			</label>
			<input
				type="checkbox" name="useBackup"
				id="use-case-backup-{ entity.id }"
				bind:checked={ useBackup }
				on:change|preventDefault={ updateSettings }
			/>
		</div>
		<div class="inner-form-item">
			<label for="use-case-deploy-{ entity.id }">
				as a deployment tool
			</label>
			<input
				type="checkbox" name="useDeploy"
				id="use-case-deploy-{ entity.id }"
				bind:checked={ useDeploy }
				on:change|preventDefault={ updateSettings }
			/>
		</div>
		<div class="inner-form-item">
			<label for="use-case-tests-{ entity.id }">
				as an automated test runner (<abbr title="continuous integration">CI</abbr> server)
			</label>
			<input
				type="checkbox" name="useTests"
				id="use-case-tests-{ entity.id }"
				bind:checked={ useTests }
				on:change|preventDefault={ updateSettings }
			/>
		</div>
	</Tooltip>
{/if}

<!-- The "quantity" and "hours per day" inputs only make sense for devices -->
{#if entity.entityType === 'device'}
	<div class="inner-form-item">
		<label for="qty-{ entity.id }">Quantity</label>
		<input class="input--s" type="number" min="1" name="qty"
			id="qty-{ entity.id }"
			value={ getValue('qty') }
			on:change|preventDefault={ updateSettings }
		/>
	</div>
	<div class="inner-form-item">
		<label for="hours-per-day-{ entity.id }">Average hours of use per day</label>
		<input class="input--s" type="number" min="1" name="hours_per_day"
			id="hours-per-day-{ entity.id }"
			value={ getValue('hours_per_day') }
			on:change|preventDefault={ updateSettings }
		/>
	</div>
{/if}

<!-- Every chosen use cases have their own settings -->
{#if useRepo}
	<div class="inner-form-item inner-form-item--l">
		<label
			for="repos-total-size-{ entity.id }"
			title="try to estimate the total size of all repos"
		>
			Approximative total size of all repositories (in Mo)
		</label>
		<input class="input--s" type="number" min="0" name="repos_total_size"
			id="repos-total-size-{ entity.id }"
			value={ getValue('repos_total_size') }
			on:change|preventDefault={ updateSettings }
		/>
	</div>
{/if}

{#if useHost}
	<div class="inner-form-item inner-form-item--l">
		<label
			for="instances-total-size-{ entity.id }"
			title="try to estimate the total size of all instances on this host (i.e. dev, stage, prod, code, assets, VMs, docker images and volumes, etc)"
		>
			Approximative total size of all instances (in Mo)
		</label>
		<input class="input--s" type="number" min="0" name="instances_total_size"
			id="instances-total-size-{ entity.id }"
			value={ getValue('instances_total_size') }
			on:change|preventDefault={ updateSettings }
		/>
	</div>
{/if}

{#if useBackup}
	<div class="inner-form-item">
		<label for="backups-per-month-{ entity.id }">
			Backups per month
		</label>
		<input class="input--s" type="number" min="1" name="backups_per_month"
			id="backups-per-month-{ entity.id }"
			value={ getValue('backups_per_month') }
			on:change|preventDefault={ updateSettings }
		/>
	</div>
	<div class="inner-form-item">
		<label for="backups-duration-{ entity.id }">
			Average backups duration (in seconds)
		</label>
		<input class="input--s" type="number" min="1" name="backups_duration"
			id="backups-duration-{ entity.id }"
			value={ getValue('backups_duration') }
			on:change|preventDefault={ updateSettings }
		/>
	</div>
	<div class="inner-form-item inner-form-item--l">
		<label
			for="backups-total-size-{ entity.id }"
			title="try to estimate the total size of all backups (i.e. code, assets, database dumps, etc.)"
		>
			Approximative total size of all backups (in Mo)
		</label>
		<input class="input--s" type="number" min="0" name="backups_total_size"
			id="backups-total-size-{ entity.id }"
			value={ getValue('backups_total_size') }
			on:change|preventDefault={ updateSettings }
		/>
	</div>
{/if}

{#if useDeploy}
	<div class="inner-form-item">
		<label
			for="deploys-per-month-{ entity.id }"
			title="on average, during the development phase of the project"
		>
			Deploys per month
		</label>
		<input class="input--s" type="number" min="1" name="deploys_per_month"
			id="deploys-per-month-{ entity.id }"
			value={ getValue('deploys_per_month') }
			on:change|preventDefault={ updateSettings }
		/>
	</div>
	<div class="inner-form-item">
		<label for="deploys-duration-{ entity.id }" title="with CI tests">
			Average deploys duration (in seconds)
		</label>
		<input class="input--s" type="number" min="1" name="deploys_duration"
			id="deploys-duration-{ entity.id }"
			value={ getValue('deploys_duration') }
			on:change|preventDefault={ updateSettings }
		/>
	</div>
{/if}

{#if useTests}
	<div class="inner-form-item">
		<label
			for="tests-per-week-{ entity.id }"
			title="on average, i.e. unit / integration / functional / visual regression tests, load testing, etc."
		>
			Average number of tests per month
		</label>
		<input class="input--s" type="number" min="1" name="tests_per_month"
			id="tests-per-week-{ entity.id }"
			value={ getValue('tests_per_month') }
			on:change|preventDefault={ updateSettings }
		/>
	</div>
	<div class="inner-form-item">
		<label for="tests-duration-{ entity.id }" title="including ">
			Average tests total duration (in seconds)
		</label>
		<input class="input--s" type="number" min="1" name="tests_duration"
			id="tests-duration-{ entity.id }"
			value={ getValue('tests_duration') }
			on:change|preventDefault={ updateSettings }
		/>
	</div>
{/if}

<style>
	.inner-form-item {
		display: flex;
		align-items: center;
		justify-content: right;
		font-size: .8rem;
	}
	.tooltip-triggers > * {
		margin-bottom: var(--space-s);
		margin-right: var(--space-s);
	}
	.tooltip-triggers > *:last-child {
		margin-right: 0;
	}
	.tooltip-triggers button {
		display: inline-block;
		vertical-align: middle;
	}
	.inner-form-item > .input--s {
		width: 3.75rem;
	}
	.inner-form-item > label {
		display: inline-block;
		margin-right: var(--space-s);
		text-align: right;
	}
</style>
