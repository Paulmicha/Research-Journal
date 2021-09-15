
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

import { selectionStore } from '../../stores/ecometrics.js';

// @see selectionUseDefaultValue()
// @see src/components/experiments/EcoMetricsSelectionSettings.svelte
export const selectionShortenedPropMap = {
	qty: 'q',
	deploys_per_month: 'd',
	deploys_duration: 'u',
	backups_per_month: 'b',
	backups_duration: 'r',
	backups_total_size: 'z',
	hours_per_day: 'h',
	location: 'l',
	repos_total_size: 'e',
	repos_commits_per_month: 'm',
	instances_total_size: 'i',
	tests_per_month: 't',
	tests_duration: 'a',
	storage_size: 'g',
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
		case "deploys_per_month":
			return 1;
		case "deploys_duration":
			return 120;
		case "backups_per_month":
			return 4;
		case "backups_duration":
			return 360;
		case "backups_total_size":
			return 5000;
		case "repos_total_size":
			return 300;
		case "repos_commits_per_month":
			return 50;
		case "instances_total_size":
			return 5000;
		case "tests_per_month":
			return 2;
		case "tests_duration":
			return 180;
		case "storage_size":
			// TODO yeah, that's pretty approximative alright.
			if ('features' in entity) {
				// -> 1Gb for email accounts (based on : 17K emails per account on
				// average for GMail, and about 60k per email).
				// @see scripts/experiments/ecometrics/manual-data/services.json
				if (entity.features.includes('mail')) {
					return 1000;
				}
				// Fallback to 300Mb for any other online service using storage.
				if (entity.features.includes('storage')) {
					return 300;
				}
			}
			// Can't really assume any data volume as a default measure for any
			// service not "caught" in the above.
			return 0;
		case "vcpu_nb":
			return 1;
		case "ram":
			return 2;
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
 * Returns the current selected entity setting value.
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
		return selection;
	});
};

/**
 * Removes selected item from the list.
 */
export const removeSelectedItem = (entity, pos) => {
	selectionStore.update(selection => {
		selection[entity.entityType].forEach((o, i) => {
			if (o.id === entity.id && i === pos) {
				selection[entity.entityType].splice(i, 1);
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
export const updateSelectedItem = (entity, pos, settings) => {
	selectionStore.update(selection => {
		selection[entity.entityType].forEach((o, i) => {
			if (o.id === entity.id && i === pos) {
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
 * Returns selected entity by entity type and id.
 */
export const getSelectedEntity = (selection, entityType, id) => {
	for (let i = 0; i < selection[entityType].length; i++) {
		const entity = selection[entityType][i];
		if (id === entity.id) {
			return entity;
		}
	}
};
