
/**
 * @file
 * Contains selection-related shared utilities for the Ecometrics experiment.
 *
 * TODO Instead of creating and managing a dedicated class or object
 * representing selected items (devices or services), the current implementation
 * directly adds an additional 'selectionSettings' prop on the entities coming
 * from parsed data.
 * -> Reevaluate this choice if this tool becomes more involved.
 *
 * @see scripts/experiments/ecometrics/extract.js
 * @see src/components/experiments/EcoMetricsSelector.svelte
 * @see src/components/experiments/EcoMetricsSelectMain.svelte
 * @see src/components/experiments/EcoMetricsSelectionSettings.svelte
 */

import { selectionStore } from '$lib/stores/ecometrics';

// Used for URL sharing. Maps the settings form input names and selection
// settings object props (all use the same keys).
// @see src/components/experiments/EcoMetricsShareLink.svelte
// @see src/components/content/DigitalEcoMetricsTool.svelte
// @see src/components/experiments/EcoMetricsSelectionSettings.svelte
export const selectionShortenedPropMap = {
	qty: 'q',
	location: 'l',
	hours_per_day: 'h',
	wh_monthly_average: 'i',
	weekly_transfer_average: 'g',
	backups_per_month: 'b',
	backups_duration: 'r',
	backups_total_size: 'z',
	backups_cpu_stress: 'f',
	backups_ram_stress: 'j',
	tests_per_month: 't',
	tests_duration: 'a',
	tests_cpu_stress: 'k',
	tests_ram_stress: 'n',
	hosting_is_baremetal: 'A', // TODO deprecate
	hosting_is_dedicated: 'v', // TODO deprecate
	hosting_cpu_stress: 'w',
	hosting_ram_stress: 'x',
	deploys_per_month: 'd', // TODO deprecate
	deploys_duration: 'u', // TODO deprecate
	repos_total_size: 'e', // TODO deprecate
	repos_commits_per_month: 'm', // TODO deprecate
	useRepo: 'p',
	useHost: 'o',
	useBackup: 'c',
	useDeploy: 'y',
	useTests: 's'
};

/**
 * Provides default values for device or service settings.
 *
 * @see scripts/experiments/ecometrics/extract.js
 */
export const getSelectedItemDefaultSetting = (entity, use) => {
	switch (use) {
		case "qty":
			return 1;
		case "hours_per_day":
			if (entity.entityType === 'device') {
				switch (entity.subcategory) {
					case 'router':
					case 'server':
						return 24;
					case 'smartphone':
						return 2;
					case 'ipphone':
						return 1;
					default:
						return 6;
				}
			}
			return 1;
		case "deploys_per_month": // TODO deprecate ?
			return 1;
		case "deploys_duration": // TODO deprecate ?
			return 120; // in seconds
		case "backups_per_month":
			return 4;
		case "backups_duration":
			return 360; // in seconds
		case "backups_total_size":
			return 500; // in Mo
		case "backups_cpu_stress":
			return 15; // in %
		case "backups_ram_stress":
			return 15; // in %
		case "repos_total_size": // TODO deprecate ?
			return 300; // in Mo
		case "repos_commits_per_month": // TODO deprecate ?
			return 50;
		case "wh_monthly_average":
			if (entity.entityType === 'device') {
				return parseInt(entity.yearly_kwh / 12 * 1000);
			}
			return 0; // in kWh/month
		case "tests_per_month":
			return 2;
		case "tests_duration":
			return 180; // in seconds
		case "tests_cpu_stress":
			return 66; // in %
		case "tests_ram_stress":
			return 66; // in %
		case "weekly_transfer_average": // in Mo
			if ('features' in entity) {
				// Average size of an email = 60k. Daily emails sent (worldwide) are
				// between 306.4B and 376.4B (stats 2020 + estimates for 2025).
				// There are 4.03 billion email users worldwide.
				// See https://techjury.net/blog/gmail-statistics/
				// See http://www.marinesatellitesystems.com/index.php?page_id=867
				if (entity.features.includes('mail')) {
					return parseInt(
						(306.4 + 376.4) / 2 * 7 // emails sent worldwide per week
						/ 4.03 // per person
						* (60 / 1024) // average weight per email in Mo
						/ 2 // -> about 150 Mo per month ? Seems high... To be more conservative, use half of that.
					);
				}
			}
			return 0;
		case "vcpu":
			return 1;
		case "ram":
			return 2;
		case "hosting_is_baremetal":
			return false;
		case "hosting_is_dedicated":
			return false;
		case "hosting_cpu_stress":
			return 5;
		case "hosting_ram_stress":
			return 15;
		case "useRepo":
		case "useHost":
		case "useBackup":
		case "useDeploy":
		case "useTests":
			return false;
	}
	return 0;
};

/**
 * Returns the current selected entity setting value or its default value.
 */
export const getSelectedItemSetting = (entity, key) => {
	if ('selectionSettings' in entity && key in entity.selectionSettings) {
		return entity.selectionSettings[key]
	}
	return getSelectedItemDefaultSetting(entity, key);
};

/**
 * Adds selected item to the list.
 */
export const addSelectedItem = async entity => {
	if (!entity) {
		return;
	}
	if (!('selectionSettings' in entity)) {
		entity.selectionSettings = {};
	}
	selectionStore.update(selection => {
		selection[entity.entityType].push(entity);
		// Maintain positions in order.
		selection[entity.entityType] = selection[entity.entityType].map((e, i) => {
			e.selectionSettings.pos = i;
			return e;
		});
		return selection;
	});
};

/**
 * Removes selected item from the list.
 */
export const removeSelectedItem = entity => {
	selectionStore.update(selection => {
		selection[entity.entityType].forEach((o, i) => {
			if (o.id === entity.id && o.selectionSettings.pos === entity.selectionSettings.pos) {
				selection[entity.entityType].splice(i, 1);
				// Maintain positions in order.
				selection[entity.entityType] = selection[entity.entityType].map((e, i) => {
					e.selectionSettings.pos = i;
					return e;
				});
				return;
			}
		});
		selection[entity.entityType] = [...selection[entity.entityType]];
		return selection;
	});
};

/**
 * Updates selected device.
 */
export const updateSelectedItem = (entity, settings) => {
	selectionStore.update(selection => {
		selection[entity.entityType].forEach((o, i) => {
			if (o.id === entity.id && o.selectionSettings.pos === entity.selectionSettings.pos) {
				selection[entity.entityType][i].selectionSettings = settings;
				return;
			}
		});
		return selection;
	});
};

/**
 * Empties the whole list of selected devices.
 */
export const clearSelection = () => {
	selectionStore.update(selection => {
		selection.device = [];
		selection.service = [];
		return selection;
	});
};

/**
 * Returns selected entity by entity type and id and pos.
 */
export const getSelectedEntity = (selection, entityType, id, pos) => {
	for (let i = 0; i < selection[entityType].length; i++) {
		const entity = selection[entityType][i];
		if (id === entity.id && entity.selectionSettings.pos === parseInt(pos)) {
			return entity;
		}
	}
};

/**
 * Returns selected entity title.
 */
export const getSelectedEntityTitle = (entity) => {
	if (entity.entityType === 'device') {
		return entity.manufacturer + ' ' + entity.name;
	}
	return entity.name;
};
