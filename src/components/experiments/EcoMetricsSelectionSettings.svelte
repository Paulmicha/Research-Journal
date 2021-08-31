<script>
	import { getSelectedItemUseDefaultValue, updateSelectedItem } from '../../lib/ecometrics/selection.js';
	import Tooltip from '../Tooltip.svelte';

	export let entity;

	let scope;

	let usesTooltipTrigger;
	let usesTooltipMethods;

	let useRepo = false;
	let useHost = false;
	let useBackup = false;
	let useDeploy = false;
	let useTests = false;

	/**
	 * TODO (wip) Updates current entity selection settings.
	 *
	 * @param {Object} e : the DOM event object.
	 * @param {Object} entity : the device or service entity to update.
	 */
	const updateSettings = (e, entity) => {
		const settings = {};

		// TODO : need to use the same "mapping" as in :
		// @see getSelectedItemUseDefaultValue()

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

<div bind:this={scope}>

	<!-- The "quantity" and "hours per day" inputs only make sense for devices -->
	{#if entity.entityType === 'device'}
		<div class="inner-form-item">
			<label for="qty-{ entity.id }">Quantity</label>
			<input class="input--s" type="number" min="1" name="qty"
				id="qty-{ entity.id }"
				value={ entity.selectionSettings.qty }
				on:change|preventDefault={ e => updateSettings(e, entity) }
			/>
		</div>
		<div class="inner-form-item">
			<label for="hours-per-day-{ entity.id }">Average hours of use per day</label>
			<input class="input--s" type="number" min="1" name="hours_per_day"
				id="hours-per-day-{ entity.id }"
				value={ entity.selectionSettings.hours_per_day || getSelectedItemUseDefaultValue(entity, 'hours_per_day') }
				on:change|preventDefault={ e => updateSettings(e, entity) }
			/>
		</div>
	{/if}

	<!-- For "server" devices and services, display an opt-in list of uses -->
	{#if entity.subcategory === 'server' || entity.entityType === 'service'}

		<!-- Tooltip for selecting use cases -->
		<div class="inner-form-item">
			<button
				class="link link--s use-case-tooltip-trigger"
				bind:this={usesTooltipTrigger}
				aria-describedby={ 'tooltip-uses-' + entity.id }
				on:click|preventDefault={usesTooltipMethods.toggle}
				title="Specify what this is used for"
			>
				Use cases
			</button>
		</div>
		{#if usesTooltipTrigger}
			<Tooltip
				id={ 'tooltip-uses-' + entity.id }
				trigger={usesTooltipTrigger}
				bind:exposedMethods={usesTooltipMethods}
			>
				<div class="inner-form-item">
					<label for="use-case-repo-{ entity.id }">
						as a code repository (e.g. git, svn)
					</label>
					<input
						type="checkbox"
						id="use-case-repo-{ entity.id }"
						bind:checked={ useRepo }
					/>
				</div>
				<div class="inner-form-item">
					<label for="use-case-host-{ entity.id }">
						as a host
					</label>
					<input
						type="checkbox"
						id="use-case-host-{ entity.id }"
						bind:checked={ useHost }
					/>
				</div>
				<div class="inner-form-item">
					<label for="use-case-backup-{ entity.id }">
						as a backup destination
					</label>
					<input
						type="checkbox"
						id="use-case-backup-{ entity.id }"
						bind:checked={ useBackup }
					/>
				</div>
				<div class="inner-form-item">
					<label for="use-case-deploy-{ entity.id }">
						as a deployment tool
					</label>
					<input
						type="checkbox"
						id="use-case-deploy-{ entity.id }"
						bind:checked={ useDeploy }
					/>
				</div>
				<div class="inner-form-item">
					<label for="use-case-tests-{ entity.id }">
						as an automated test runner (<abbr title="continuous integration">CI</abbr> server)
					</label>
					<input
						type="checkbox"
						id="use-case-tests-{ entity.id }"
						bind:checked={ useTests }
					/>
				</div>
			</Tooltip>
		{/if}

		<!-- Every chosen use cases have their own settings -->
		{#if useRepo}
			<div class="inner-form-item">
				<label
					for="repos-total-size-{ entity.id }"
					title="try to estimate the total size of all repos"
				>
					Approximative total size of all repositories (in Mo)
				</label>
				<input class="input--s" type="number" min="0" name="repos_total_size"
					id="repos-total-size-{ entity.id }"
					value={ entity.selectionSettings.repos_total_size || getSelectedItemUseDefaultValue(entity, 'repos_total_size') }
					on:change|preventDefault={ e => updateSettings(e, entity) }
				/>
			</div>
		{/if}

		{#if useHost}
			<div class="inner-form-item">
				<label
					for="instances-total-size-{ entity.id }"
					title="try to estimate the total size of all instances on this host (i.e. dev, stage, prod, code, assets, VMs, docker images and volumes, etc)"
				>
					Approximative total size of all instances (in Mo)
				</label>
				<input class="input--s" type="number" min="0" name="instances_total_size"
					id="instances-total-size-{ entity.id }"
					value={ entity.selectionSettings.instances_total_size || getSelectedItemUseDefaultValue(entity, 'instances_total_size') }
					on:change|preventDefault={ e => updateSettings(e, entity) }
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
					value={ entity.selectionSettings.backups_per_month || getSelectedItemUseDefaultValue(entity, 'backups_per_month') }
					on:change|preventDefault={ e => updateSettings(e, entity) }
				/>
			</div>
			<div class="inner-form-item">
				<label for="backups-duration-{ entity.id }">
					Average backups duration (in seconds)
				</label>
				<input class="input--s" type="number" min="1" name="backups_duration"
					id="backups-duration-{ entity.id }"
					value={ entity.selectionSettings.backups_duration || getSelectedItemUseDefaultValue(entity, 'backups_duration') }
					on:change|preventDefault={ e => updateSettings(e, entity) }
				/>
			</div>
			<div class="inner-form-item">
				<label
					for="backups-total-size-{ entity.id }"
					title="try to estimate the total size of all backups (i.e. code, assets, database dumps, etc.)"
				>
					Approximative total size of all backups (in Mo)
				</label>
				<input class="input--s" type="number" min="0" name="backups_total_size"
					id="backups-total-size-{ entity.id }"
					value={ entity.selectionSettings.backups_total_size || getSelectedItemUseDefaultValue(entity, 'backups_total_size') }
					on:change|preventDefault={ e => updateSettings(e, entity) }
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
					value={ entity.selectionSettings.deploys_per_month || getSelectedItemUseDefaultValue(entity, 'deploys_per_month') }
					on:change|preventDefault={ e => updateSettings(e, entity) }
				/>
			</div>
			<div class="inner-form-item">
				<label for="deploys-duration-{ entity.id }" title="with CI tests">
					Average deploys duration (in seconds)
				</label>
				<input class="input--s" type="number" min="1" name="deploys_duration"
					id="deploys-duration-{ entity.id }"
					value={ entity.selectionSettings.deploys_duration || getSelectedItemUseDefaultValue(entity, 'deploys_duration') }
					on:change|preventDefault={ e => updateSettings(e, entity) }
				/>
			</div>
		{/if}

		{#if useTests}
			<div class="inner-form-item">
				<label
					for="tests-per-week-{ entity.id }"
					title="on average, i.e. unit / integration / functional / visual regression tests, load testing, etc."
				>
					Average number of tests per week
				</label>
				<input class="input--s" type="number" min="1" name="tests_per_week"
					id="tests-per-week-{ entity.id }"
					value={ entity.selectionSettings.tests_per_week || getSelectedItemUseDefaultValue(entity, 'tests_per_week') }
					on:change|preventDefault={ e => updateSettings(e, entity) }
				/>
			</div>
			<div class="inner-form-item">
				<label for="tests-duration-{ entity.id }" title="including ">
					Average tests total duration (in seconds)
				</label>
				<input class="input--s" type="number" min="1" name="tests_duration"
					id="tests-duration-{ entity.id }"
					value={ entity.selectionSettings.tests_duration || getSelectedItemUseDefaultValue(entity, 'tests_duration') }
					on:change|preventDefault={ e => updateSettings(e, entity) }
				/>
			</div>
		{/if}

	{/if}
</div>

<style>
	.use-case-tooltip-trigger {
		margin: var(--space-xs) auto;
	}
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
		text-align: right;
	}
</style>
