
/**
 * @file
 * Contains selection-related shared utilities for the Ecometrics experiment.
 */

/**
 * Provides default values for device or service use settings.
 */
export const getDeviceUseDefaultValue = (device, use) => {
	switch (use) {
		case "hours":
			switch (device.data.subcategory) {
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
			if (device.data.subcategory !== 'server') {
				return 0;
			}
			return 4;
		case "deploys_duration":
			if (device.data.subcategory !== 'server') {
				return 0;
			}
			return 120;
		case "backups_nb":
		case "backups_duration":
			return 0;
	}
	return 6;
};

export const selectionOneLetterPropMap = {
	qty: 'q',
	deploys_nb: 'd',
	deploys_duration: 'u',
	backups_nb: 'b',
	backups_duration: 'r',
	hours: 'h',
	location: 'l'
};
