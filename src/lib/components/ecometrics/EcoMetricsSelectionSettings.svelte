
<!-- <script context="module">
	// TODO implement a static counter of all instances of this component to
	// also have it in the results area of the page without botching the "id"
	// attributes ? Would need to rework the "singleton" Tooltip for locations.
</script> -->

<script>
	import { selectionStore } from '$lib/stores/ecometrics.js';
	import {
		getSelectedItemDefaultSetting,
		updateSelectedItem,
		getSelectedItemSetting,
		getSelectedEntityTitle
	} from '$lib/ecometrics/selection.js';
	import { getLocationLabel } from '$lib/ecometrics/location.js';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import Ellipsis from '$lib/components/Ellipsis.svelte';

	// Device or service data input.
	export let entity;

	// Reuse the location tooltip "singleton".
	// @see src/components/experiments/EcoMetricsSelector.svelte
	export let toggleLocationTooltip;

	let advancedSettingsTooltipTrigger;
	let advancedSettingsTooltipMethods;

	// Using variables allows to benefit from Svelte's {#if} "auto-update".
	// let useRepo = getSelectedItemSetting(entity, 'useRepo');
	let useHost = getSelectedItemSetting(entity, 'useHost');
	let useBackup = getSelectedItemSetting(entity, 'useBackup');
	// let useDeploy = getSelectedItemSetting(entity, 'useDeploy');
	let useTests = getSelectedItemSetting(entity, 'useTests');

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
		if (comparedValue != getSelectedItemDefaultSetting(entity, e.target.name)) {
			settings[e.target.name] = comparedValue;
		} else {
			delete settings[e.target.name];
		}
		updateSelectedItem(entity, settings);
		e.target.blur();
		// Updates tooltip position.
		if (advancedSettingsTooltipMethods) {
			advancedSettingsTooltipMethods.open();
		}
	};

	/**
	 * Determines if the "use cases" tooltip applies to current entity.
	 */
	const entityQualifiesForAdvancedSettings = () => {
		if ('subcategory' in entity && entity.subcategory === 'server') {
			return true;
		}
		const types = ['cloud', 'paas'];
		if ('type' in entity && types.includes(entity.type)) {
			return true;
		}
		return false;
	};

	/**
	 * Reverts given setting to its default value.
	 */
	const reset = setting => {
		delete entity.selectionSettings[setting];
		const tooltipWasOpen = advancedSettingsTooltipMethods.getCurrentState();
		// TODO figure out exactly why this closes the tooltip if it was open.
		updateSelectedItem(entity, entity.selectionSettings);
		if (tooltipWasOpen) {
			// TODO find better workaround when tooltip does not stay open when
			// calling open() immediately here.
			setTimeout(() => {
				advancedSettingsTooltipMethods.open();
			}, 33);
		}
	};
</script>

<!-- Tooltips for selecting use cases and location -->
<div class="form-item tooltip-triggers">
	<button
		class="link link--s"
		bind:this={ advancedSettingsTooltipTrigger }
		aria-describedby={ 'tooltip-uses-' + entity.id }
		on:click|preventDefault={ advancedSettingsTooltipMethods.toggle }
	>
		Advanced settings
	</button>
	<!-- Any selected entity may override the default location -->
	<div class="location-wrap">
		<button
			class="link link--s"
			aria-describedby='tooltip-default-location'
			on:click|preventDefault={ toggleLocationTooltip }
			data-entity-id={ entity.id }
			data-entity-type={ entity.entityType }
			data-entity-pos={ entity.selectionSettings.pos }
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
{#if advancedSettingsTooltipTrigger}
	<Tooltip
		id={ 'tooltip-uses-' + entity.id }
		trigger={ advancedSettingsTooltipTrigger }
		bind:exposedMethods={ advancedSettingsTooltipMethods }
	>
		<p class="advanced-settings-title">
			Advanced settings for the
			<strong>{ getSelectedEntityTitle(entity) }</strong>
			{ entity.entityType }
		</p>

		<!-- Allow manual oveeride for average power consumption estimate -->
		<div class="form-item form-item--l">
			<label
				for="power-monthly-average-{ entity.id }"
				title="If you already have this monthly estimate (in Watts per Hour), it will be used instead of { entity.entityType === 'service' ? "our own (very) approximative calculations for this service - if we have any" : "the value for this device from sources indicated below" }."
				tabindex="0"
			>
				Average W/h per month
			</label>
			{#if getSelectedItemSetting(entity, 'wh_monthly_average') !== getSelectedItemDefaultSetting(entity, 'wh_monthly_average')}
				<button class="btn btn--s btn--rounded"
					title="Reset to default value"
					on:click|preventDefault={ () => reset('wh_monthly_average') }
				>
					↻
				</button>
			{/if}
			<input class="input--s larger-number" type="number" min="0" name="wh_monthly_average"
				id="power-monthly-average-{ entity.id }"
				value={ getSelectedItemSetting(entity, 'wh_monthly_average') }
				on:change|preventDefault={ updateSettings }
			/>
		</div>

		<!--
			For "server" devices and cloud/paas services, display advanced settings.
			TODO we could devise some kind of dynamic settings from data source if we
			keep manually adding more details for services.
			@see scripts/experiments/ecometrics/manual-data/services.json
		-->
		{#if entityQualifiesForAdvancedSettings()}
			<hr class="u-m-t" />
			<p class="form-item-info">
				<strong>Or</strong>&nbsp;:
				specify its use cases to provide <i>very</i> approximative estimates (see "warnings") :
			</p>
			<!-- <div class="form-item">
				<label for="use-case-repo-{ entity.id }">
					as a code repository (e.g. git, svn)
				</label>
				<input
					type="checkbox" name="useRepo"
					id="use-case-repo-{ entity.id }"
					bind:checked={ useRepo }
					on:change|preventDefault={ updateSettings }
				/>
			</div> -->
			<div class="form-item">
				<label for="use-case-host-{ entity.id }">
					as a host (webserver)
				</label>
				<input
					type="checkbox" name="useHost"
					id="use-case-host-{ entity.id }"
					bind:checked={ useHost }
					on:change|preventDefault={ updateSettings }
				/>
			</div>
			<div class="form-item">
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
			<!-- <div class="form-item">
				<label for="use-case-deploy-{ entity.id }">
					as a deployment tool
				</label>
				<input
					type="checkbox" name="useDeploy"
					id="use-case-deploy-{ entity.id }"
					bind:checked={ useDeploy }
					on:change|preventDefault={ updateSettings }
				/>
			</div> -->
			<div class="form-item u-m-b">
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

			{#if useHost}
				<div class="form-item">
					<label for="hosting-is-baremetal-{ entity.id }"
						title="Temporary experimental factor on CPU and RAM power consumption estimates (× 3) - this will be removed in the next release of this tool"
						tabindex="0"
					>
						Instance is "baremetal"
					</label>
					<input
						type="checkbox" name="hosting_is_baremetal"
						id="hosting-is-baremetal-{ entity.id }"
						checked={ getSelectedItemSetting(entity, 'hosting_is_baremetal') }
						on:change|preventDefault={ updateSettings }
					/>
				</div>
				<div class="form-item u-m-b">
					<label for="hosting-is-dedicated-{ entity.id }"
						title="Temporary experimental factor on CPU and RAM power consumption estimates (× 1.5) - this will be removed in the next release of this tool"
						tabindex="0"
					>
						Instance is dedicated
					</label>
					<input
						type="checkbox" name="hosting_is_dedicated"
						id="hosting-is-dedicated-{ entity.id }"
						checked={ getSelectedItemSetting(entity, 'hosting_is_dedicated') }
						on:change|preventDefault={ updateSettings }
					/>
				</div>
			{/if}

			{#if useHost || useTests}
				<div class="form-item form-item--l">
					<label
						for="vcpu-{ entity.id }"
						title="Indicate the number of vCPU allocated for running this service"
						tabindex="0"
					>
						vCPU allocation
					</label>
					{#if getSelectedItemSetting(entity, 'vcpu') !== getSelectedItemDefaultSetting(entity, 'vcpu')}
						<button class="btn btn--s btn--rounded"
							title="Reset to default value"
							on:click|preventDefault={ () => reset('vcpu') }
						>
							↻
						</button>
					{/if}
					<input class="input--s" type="number" min="0" name="vcpu"
						id="vcpu-{ entity.id }"
						value={ getSelectedItemSetting(entity, 'vcpu') }
						on:change|preventDefault={ updateSettings }
					/>
				</div>
				<div class="form-item form-item--l">
					<label
						for="ram-{ entity.id }"
						title="If appropriate, indicate the amount of RAM allocated for running this service"
						tabindex="0"
					>
						RAM allocation (Gb)
					</label>
					{#if getSelectedItemSetting(entity, 'ram') !== getSelectedItemDefaultSetting(entity, 'ram')}
						<button class="btn btn--s btn--rounded"
							title="Reset to default value"
							on:click|preventDefault={ () => reset('ram') }
						>
							↻
						</button>
					{/if}
					<input class="input--s" type="number" min="0" name="ram"
						id="ram-{ entity.id }"
						value={ getSelectedItemSetting(entity, 'ram') }
						on:change|preventDefault={ updateSettings }
					/>
				</div>
			{/if}

			{#if useHost}
				<div class="form-item">
					<label for="hosting-cpu-stress-{ entity.id }">
						Average CPU stress for hosting (in %)
					</label>
					{#if getSelectedItemSetting(entity, 'hosting_cpu_stress') !== getSelectedItemDefaultSetting(entity, 'hosting_cpu_stress')}
						<button class="btn btn--s btn--rounded"
							title="Reset to default value"
							on:click|preventDefault={ () => reset('hosting_cpu_stress') }
						>
							↻
						</button>
					{/if}
					<input class="input--s" type="number" min="1" name="hosting_cpu_stress"
						id="hosting-cpu-stress-{ entity.id }"
						value={ getSelectedItemSetting(entity, 'hosting_cpu_stress') }
						on:change|preventDefault={ updateSettings }
					/>
				</div>
				<div class="form-item">
					<label for="hosting-ram-stress-{ entity.id }">
						Average RAM stress for hosting (in %)
					</label>
					{#if getSelectedItemSetting(entity, 'hosting_ram_stress') !== getSelectedItemDefaultSetting(entity, 'hosting_ram_stress')}
						<button class="btn btn--s btn--rounded"
							title="Reset to default value"
							on:click|preventDefault={ () => reset('hosting_ram_stress') }
						>
							↻
						</button>
					{/if}
					<input class="input--s" type="number" min="1" name="hosting_ram_stress"
						id="hosting-ram-stress-{ entity.id }"
						value={ getSelectedItemSetting(entity, 'hosting_ram_stress') }
						on:change|preventDefault={ updateSettings }
					/>
				</div>
			{/if}

			<!-- {#if useRepo}
				<div class="form-item form-item--l">
					<label
						for="repos-total-size-{ entity.id }"
						title="try to estimate the total size of all repos"
						tabindex="0"
					>
						Approximative total size of all repositories (in Mo)
					</label>
					<input class="input--s" type="number" min="0" name="repos_total_size"
						id="repos-total-size-{ entity.id }"
						value={ getSelectedItemSetting(entity, 'repos_total_size') }
						on:change|preventDefault={ updateSettings }
					/>
				</div>
				<div class="form-item form-item--l">
					<label
						for="repos-commits-per-month-{ entity.id }"
					>
						Average number of commits per month (all repos)
					</label>
					<input class="input--s" type="number" min="0" name="repos_commits_per_month"
						id="repos-commits-per-month-{ entity.id }"
						value={ getSelectedItemSetting(entity, 'repos_commits_per_month') }
						on:change|preventDefault={ updateSettings }
					/>
				</div>
			{/if} -->

			{#if useBackup}
				<div class="form-item">
					<label for="backups-per-month-{ entity.id }">
						Backups per month
					</label>
					{#if getSelectedItemSetting(entity, 'backups_per_month') !== getSelectedItemDefaultSetting(entity, 'backups_per_month')}
						<button class="btn btn--s btn--rounded"
							title="Reset to default value"
							on:click|preventDefault={ () => reset('backups_per_month') }
						>
							↻
						</button>
					{/if}
					<input class="input--s" type="number" min="1" name="backups_per_month"
						id="backups-per-month-{ entity.id }"
						value={ getSelectedItemSetting(entity, 'backups_per_month') }
						on:change|preventDefault={ updateSettings }
					/>
				</div>
				<div class="form-item">
					<label for="backups-duration-{ entity.id }">
						Average backups duration (in seconds)
					</label>
					{#if getSelectedItemSetting(entity, 'backups_duration') !== getSelectedItemDefaultSetting(entity, 'backups_duration')}
						<button class="btn btn--s btn--rounded"
							title="Reset to default value"
							on:click|preventDefault={ () => reset('backups_duration') }
						>
							↻
						</button>
					{/if}
					<input class="input--s larger-number" type="number" min="1" name="backups_duration"
						id="backups-duration-{ entity.id }"
						value={ getSelectedItemSetting(entity, 'backups_duration') }
						on:change|preventDefault={ updateSettings }
					/>
				</div>
				<div class="form-item form-item--l">
					<label
						for="backups-total-size-{ entity.id }"
						title="try to estimate the total size of all backups (i.e. code, assets, database dumps, etc.)"
						tabindex="0"
					>
						Approximative total size of all backups (in Mo)
					</label>
					{#if getSelectedItemSetting(entity, 'backups_total_size') !== getSelectedItemDefaultSetting(entity, 'backups_total_size')}
						<button class="btn btn--s btn--rounded"
							title="Reset to default value"
							on:click|preventDefault={ () => reset('backups_total_size') }
						>
							↻
						</button>
					{/if}
					<input class="input--s larger-number" type="number" min="0" name="backups_total_size"
						id="backups-total-size-{ entity.id }"
						value={ getSelectedItemSetting(entity, 'backups_total_size') }
						on:change|preventDefault={ updateSettings }
					/>
				</div>
				<div class="form-item">
					<label for="backups-cpu-stress-{ entity.id }">
						Average CPU stress during backup (in %)
					</label>
					{#if getSelectedItemSetting(entity, 'backups_cpu_stress') !== getSelectedItemDefaultSetting(entity, 'backups_cpu_stress')}
						<button class="btn btn--s btn--rounded"
							title="Reset to default value"
							on:click|preventDefault={ () => reset('backups_cpu_stress') }
						>
							↻
						</button>
					{/if}
					<input class="input--s" type="number" min="1" name="backups_cpu_stress"
						id="backups-cpu-stress-{ entity.id }"
						value={ getSelectedItemSetting(entity, 'backups_cpu_stress') }
						on:change|preventDefault={ updateSettings }
					/>
				</div>
				<div class="form-item">
					<label for="backups-ram-stress-{ entity.id }">
						Average RAM stress during backup (in %)
					</label>
					{#if getSelectedItemSetting(entity, 'backups_ram_stress') !== getSelectedItemDefaultSetting(entity, 'backups_ram_stress')}
						<button class="btn btn--s btn--rounded"
							title="Reset to default value"
							on:click|preventDefault={ () => reset('backups_ram_stress') }
						>
							↻
						</button>
					{/if}
					<input class="input--s" type="number" min="1" name="backups_ram_stress"
						id="backups-ram-stress-{ entity.id }"
						value={ getSelectedItemSetting(entity, 'backups_ram_stress') }
						on:change|preventDefault={ updateSettings }
					/>
				</div>
			{/if}

			<!-- {#if useDeploy}
				<div class="form-item">
					<label
						for="deploys-per-month-{ entity.id }"
						title="on average, during the development phase of the project"
						tabindex="0"
					>
						Deploys per month
					</label>
					<input class="input--s" type="number" min="1" name="deploys_per_month"
						id="deploys-per-month-{ entity.id }"
						value={ getSelectedItemSetting(entity, 'deploys_per_month') }
						on:change|preventDefault={ updateSettings }
					/>
				</div>
				<div class="form-item">
					<label for="deploys-duration-{ entity.id }" title="with CI tests" tabindex="0">
						Average deploys duration (in seconds)
					</label>
					<input class="input--s" type="number" min="1" name="deploys_duration"
						id="deploys-duration-{ entity.id }"
						value={ getSelectedItemSetting(entity, 'deploys_duration') }
						on:change|preventDefault={ updateSettings }
					/>
				</div>
			{/if} -->

			{#if useTests}
				<div class="form-item">
					<label
						for="tests-per-week-{ entity.id }"
						title="on average, i.e. unit / integration / functional / visual regression tests, load testing, etc."
						tabindex="0"
					>
						Average number of tests per month
					</label>
					{#if getSelectedItemSetting(entity, 'tests_per_month') !== getSelectedItemDefaultSetting(entity, 'tests_per_month')}
						<button class="btn btn--s btn--rounded"
							title="Reset to default value"
							on:click|preventDefault={ () => reset('tests_per_month') }
						>
							↻
						</button>
					{/if}
					<input class="input--s" type="number" min="1" name="tests_per_month"
						id="tests-per-week-{ entity.id }"
						value={ getSelectedItemSetting(entity, 'tests_per_month') }
						on:change|preventDefault={ updateSettings }
					/>
				</div>
				<div class="form-item">
					<label for="tests-duration-{ entity.id }">
						Average tests total duration (in seconds)
					</label>
					{#if getSelectedItemSetting(entity, 'tests_duration') !== getSelectedItemDefaultSetting(entity, 'tests_duration')}
						<button class="btn btn--s btn--rounded"
							title="Reset to default value"
							on:click|preventDefault={ () => reset('tests_duration') }
						>
							↻
						</button>
					{/if}
					<input class="input--s" type="number" min="1" name="tests_duration"
						id="tests-duration-{ entity.id }"
						value={ getSelectedItemSetting(entity, 'tests_duration') }
						on:change|preventDefault={ updateSettings }
					/>
				</div>
				<div class="form-item">
					<label for="tests-cpu-stress-{ entity.id }">
						Average CPU stress during tests (in %)
					</label>
					{#if getSelectedItemSetting(entity, 'tests_cpu_stress') !== getSelectedItemDefaultSetting(entity, 'tests_cpu_stress')}
						<button class="btn btn--s btn--rounded"
							title="Reset to default value"
							on:click|preventDefault={ () => reset('tests_cpu_stress') }
						>
							↻
						</button>
					{/if}
					<input class="input--s" type="number" min="1" name="tests_cpu_stress"
						id="tests-cpu-stress-{ entity.id }"
						value={ getSelectedItemSetting(entity, 'tests_cpu_stress') }
						on:change|preventDefault={ updateSettings }
					/>
				</div>
				<div class="form-item">
					<label for="tests-ram-stress-{ entity.id }">
						Average RAM stress during tests (in %)
					</label>
					{#if getSelectedItemSetting(entity, 'tests_ram_stress') !== getSelectedItemDefaultSetting(entity, 'tests_ram_stress')}
						<button class="btn btn--s btn--rounded"
							title="Reset to default value"
							on:click|preventDefault={ () => reset('tests_ram_stress') }
						>
							↻
						</button>
					{/if}
					<input class="input--s" type="number" min="1" name="tests_ram_stress"
						id="tests-ram-stress-{ entity.id }"
						value={ getSelectedItemSetting(entity, 'tests_ram_stress') }
						on:change|preventDefault={ updateSettings }
					/>
				</div>
			{/if}
		{/if}
	</Tooltip>
{/if}

<!-- The "quantity" and "hours per day" inputs only make sense for devices -->
{#if entity.entityType === 'device'}
	<div class="form-item">
		<label for="qty-{ entity.id }">Quantity</label>
		<input class="input--s" type="number" min="1" name="qty"
			id="qty-{ entity.id }"
			value={ getSelectedItemSetting(entity, 'qty') }
			on:change|preventDefault={ updateSettings }
		/>
	</div>
	<div class="form-item">
		<label for="hours-per-day-{ entity.id }">Average hours of use per day</label>
		<input class="input--s" type="number" min="1" name="hours_per_day"
			id="hours-per-day-{ entity.id }"
			value={ getSelectedItemSetting(entity, 'hours_per_day') }
			on:change|preventDefault={ updateSettings }
		/>
	</div>
{/if}

<!-- Generic measure to estimate the networking impact of data transmission -->
{#if entity.entityType === 'service' && !useBackup}
	<div class="form-item form-item--l">
		<label
			for="weekly-transfer-average-{ entity.id }"
			title="If you can, try and provide the average amount of data transferred to and from this service every week (overall, i.e. for you and everyone else in your organisation if appropriate)"
			tabindex="0"
		>
			Average volume of data transferred weekly (in Mo)
		</label>
		<input class="input--s larger-number" type="number" min="0" name="weekly_transfer_average"
			id="weekly-transfer-average-{ entity.id }"
			value={ getSelectedItemSetting(entity, 'weekly_transfer_average') }
			on:change|preventDefault={ updateSettings }
		/>
	</div>
{/if}

<style>
	.form-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		font-size: .8rem;
	}
	.form-item > .input--s {
		width: 3.75rem;
	}
	.input--s.larger-number {
		width: 5.25rem;
	}
	.form-item-info {
		margin: var(--space-s) 0 var(--space-xs) 0;
		font-size: .8rem;
		width: 42ch;
	}
	.advanced-settings-title {
		font-size: .66rem;
		text-align: center;
		margin: 0 auto var(--space-s) auto;
		max-width: 42ch;
		text-transform: uppercase;
		letter-spacing: .1ch;
	}
	.form-item > label {
		display: inline-block;
		flex-grow: 1;
		margin-right: var(--space-s);
		text-align: right;
	}
	.form-item > .btn.btn--s.btn--rounded {
		margin: 0 var(--space-s) 0 0;
	}
	.form-item.tooltip-triggers {
		justify-content: flex-end;
	}
	.tooltip-triggers > * {
		display: inline-block;
		margin-bottom: var(--space-s);
		margin-right: var(--space-s);
	}
	.tooltip-triggers > *:last-child {
		margin-right: 0;
	}
	.tooltip-triggers button {
		vertical-align: middle;
	}
	label[title] {
		position: relative;
		cursor: pointer;
	}
	label[title]::before {
		content: 'ℹ️';
		position: relative;
		top: -.1em;
		padding-right: var(--space-xs);
		font-size: .8em;
	}
	label[title]:hover,
	label[title]:focus {
		color: cornflowerblue;
	}
	label[title]:focus::after {
		content: attr(title);
		position: absolute;
		left: var(--space);
		top: calc(100% + var(--space-xs));
		z-index: 1;
		border: 1px solid #CFCFCF;
		padding: var(--space-xs) var(--space-s);
		width: 36ch;
		text-align: left;
		background-color: white;
		box-shadow: 0 2px 3px 0 rgba(44, 62, 80, 0.24);
	}
</style>
