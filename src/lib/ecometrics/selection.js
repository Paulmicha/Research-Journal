
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
		case "qty":
			return 1;
		case "hours_per_day":
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
		case "instances_total_size":
			return 5000;
		case "tests_per_month":
			return 2;
		case "tests_duration":
			return 180;
	}
	return 0;
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
export const removeSelectedItem = entity => {
	selectionStore.update(selection => {
		selection[entity.entityType].forEach((o, i) => {
			if (o.id === entity.id) {
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
export const updateSelectedItem = (entity, settings) => {
	selectionStore.update(selection => {
		selection[entity.entityType].forEach((o, i) => {
			if (o.id === entity.id) {
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
