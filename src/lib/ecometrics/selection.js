
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
 * @see src/components/experiments/EcoMetricsSelectMain.svelte
 */

import { selectionStore } from '../../stores/ecometrics.js';

export const selectionOneLetterPropMap = {
	qty: 'q',
	deploys_nb: 'd',
	deploys_duration: 'u',
	backups_nb: 'b',
	backups_duration: 'r',
	hours: 'h',
	location: 'l'
};

/**
 * Provides default values for device or service use settings.
 *
 * TODO how to map which settings are exposed in UI for given item based on the
 * "kind" of device or service ?
 * -> For now : case by case, hardcoded.
 *
 * TODO could be like a "tag" system (comma separated ?) to allow more
 * flexible and precise settings attributions.
 * -> Replace 'subcategory' and 'type' from source data tranforms.
 * @see scripts/experiments/ecometrics/extract.js
 */
export const getSelectedItemUseDefaultValue = (entity, use) => {
	switch (use) {
		case "hours":
			// Assumes entity.entityType === 'device'.
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
		case "deploys_nb":
			return 4;
		case "deploys_duration":
			return 120;
		case "backups_nb":
		case "backups_duration":
			return 0;
	}
	return 6;
};

/**
 * Adds selected item to the list.
 *
 * TODO how to map which settings are exposed in UI for given item based on the
 * "kind" of device or service ?
 * -> For now : case by case, hardcoded.
 *
 * TODO could be like a "tag" system (comma separated ?) to allow more
 * flexible and precise settings attributions.
 * -> Replace 'subcategory' and 'type' from source data tranforms.
 * @see scripts/experiments/ecometrics/extract.js
 */
export const addSelectedItem = async entity => {
	if (!entity) {
		return;
	}
	if (!('selectionSettings' in entity)) {
		entity.selectionSettings = {};
	}
	selectionStore.update(selection => {
		if (entity.entityType === 'service') {
			if (entity.type === 'saas') {
				entity.selectionSettings.deploys_nb = getSelectedItemUseDefaultValue(entity, 'deploys_nb');
				entity.selectionSettings.deploys_duration = getSelectedItemUseDefaultValue(entity, 'deploys_duration');
			}
			selection.services.push(entity);
		} else {
			entity.selectionSettings.qty = 1;
			entity.selectionSettings.hours = getSelectedItemUseDefaultValue(entity, 'hours');
			if (entity.subcategory === 'server') {
				entity.selectionSettings.deploys_nb = getSelectedItemUseDefaultValue(entity, 'deploys_nb');
				entity.selectionSettings.deploys_duration = getSelectedItemUseDefaultValue(entity, 'deploys_duration');
				entity.selectionSettings.backups_nb = getSelectedItemUseDefaultValue(entity, 'backups_nb');
				entity.selectionSettings.backups_duration = getSelectedItemUseDefaultValue(entity, 'backups_duration');
			}
			selection.devices.push(entity);
		}
		return selection;
	});
};

/**
 * Removes selected item from the list.
 */
export const removeSelectedItem = entity => {
	selectionStore.update(selection => {
		if (entity.entityType === 'service') {
			selection.services.forEach((service, i) => {
				if (service.id === entity.id) {
					selection.services.splice(i, 1);
					return;
				}
			});
			selection.services = [...selection.services];
		} else {
			selection.devices.forEach((device, i) => {
				if (device.id === entity.id) {
					selection.devices.splice(i, 1);
					return;
				}
			});
			selection.devices = [...selection.devices];
		}
		return selection;
	});
};

/**
 * Empties the whole list of selected devices.
 */
export const clearSelection = () => {
	selectionStore.update(selection => {
		selection.devices = [];
		selection.services = [];
		return selection;
	});
};
